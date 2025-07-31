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
        <>
            {counters.map((item, index) => (
                <div key={item.id} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                    <Link to={item.path} className="text-decoration-none">
                        <div className="dashboard__counter-item card shadow-sm border-0 h-100">
                            <div className={`card-body d-flex flex-column align-items-center justify-content-center p-4 bg-${
                                index === 0 ? 'light-blue' : 
                                index === 1 ? 'light-green' : 
                                index === 2 ? 'light-gray' : 'light-yellow'
                            } text-dark`}>
                                <div className="icon mb-2">
                                    <i className={`${item.icon} fa-2x`}></i>
                                </div>
                                <div className="content text-center">
                                    <div className="count display-6 fw-bold mb-1 text-danger">
                                        <Count number={item.count} />
                                    </div>
                                    <p className="mb-0 opacity-75">{item.title}</p>
                                </div>
                            </div>
                            <div className="card-footer bg-white border-0 py-2 text-center">
                                <small className="text-muted">คลิกเพื่อดูรายละเอียด</small>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
            <style>{`
                .dashboard__counter-item {
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }

                .dashboard__counter-item:hover {
                    transform: translateY(-5px);
                }

                .card-body {
                    min-height: 150px;
                    padding: 1.5rem;
                    text-align: center;
                }

                .bg-light-blue {
                    background-color: #e6f0fa;
                }

                .bg-light-green {
                    background-color: #e6f4e6;
                }

                .bg-light-gray {
                    background-color: #f0f2f5;
                }

                .bg-light-yellow {
                    background-color: #fff3e0;
                }

                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .count {
                    font-size: 2.5rem;
                    line-height: 1.2;
                }

                .text-danger {
                    color: #dc3545 !important;
                }

                .card-footer {
                    padding: 0.75rem;
                }

                /* Ensure proper spacing */
                .col-lg-3, .col-md-6, .col-sm-6 {
                    padding-left: 15px;
                    padding-right: 15px;
                }

                /* Responsive adjustments */
                @media (max-width: 991px) {
                    .col-lg-3 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                }

                @media (max-width: 576px) {
                    .col-lg-3 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }

                    .card-body {
                        min-height: 120px;
                    }

                    .count {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </>
    );
};

export default AdminCounter;