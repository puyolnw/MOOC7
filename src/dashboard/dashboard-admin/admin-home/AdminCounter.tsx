import { useState, useEffect } from 'react';
import Count from "../../../components/common/Count";
import admin_count_data from "../../../data/dashboard-data/AdminCounterData";
import { Link } from "react-router-dom";
import axios from 'axios';

const AdminCounter = () => {
    const [counters, setCounters] = useState(admin_count_data);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
      const fetchCounts = async () => {
         try {
             const token = localStorage.getItem('token');
             if (!token) return;
     
             const [courses, users, completions, instructors] = await Promise.all([
                 axios.get(`${apiURL}/api/courses/total/all`, {
                     headers: { Authorization: `Bearer ${token}` }
                 }),
                 axios.get(`${apiURL}/api/accounts/students/count/total`, {
                     headers: { Authorization: `Bearer ${token}` }
                 }),
                 axios.get(`${apiURL}/api/courses/enrollments/completed`, {
                     headers: { Authorization: `Bearer ${token}` }
                 }),
                 axios.get(`${apiURL}/api/courses/instructors/total`, {
                     headers: { Authorization: `Bearer ${token}` }
                 })
             ]);
     
             setCounters(prev => prev.map(counter => {
                 switch(counter.id) {
                     case 1: return {...counter, count: courses.data.count};
                     case 2: return {...counter, count: users.data.count};
                     case 3: return {...counter, count: completions.data.count};
                     case 4: return {...counter, count: instructors.data.count};
                     default: return counter;
                 }
             }));
         } catch (error) {
             console.error('Error fetching counts:', error);
         }
     };
     
     

        fetchCounts();
    }, [apiURL]);

    return (
        <div className="row">
            {counters.map((item) => (
                <div key={item.id} className="col-lg-3 col-md-6 col-sm-6">
                    <Link to={item.path}>
                        <div className="dashboard__counter-item">
                            <div className="icon">
                                <i className={item.icon}></i>
                            </div>
                            <div className="content">
                                <span className="count"><Count number={item.count} /></span>
                                <p style={{marginTop:"5px"}}>{item.title}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default AdminCounter;
