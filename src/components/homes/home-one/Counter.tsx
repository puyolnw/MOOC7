import Count from "../../common/Count";

interface DataType {
   id: number;
   count: number;
   count_text: string;
   text: string;
};

const count_data: DataType[] = [
   {
      id: 1,
      count: 45,
      count_text: "K+",
      text: "นักเรียนที่ใช้งานอยู่",
   },
   {
      id: 2,
      count: 89,
      count_text: "+",
      text: "หลักสูตรของคณะ",
   },
   {
      id: 3,
      count: 156,
      count_text: "K",
      text: "อาจารย์ที่ดีที่สุด",
   },
   {
      id: 4,
      count: 42,
      count_text: "K",
      text: "รางวัลที่ได้รับ",
   },
];

const Counter = () => {
   return (
      <section className="fact__area">
         <div className="container">
            <div className="fact__inner-wrap">
               <div className="row">
                  {count_data.map((item) => (
                     <div key={item.id} className="col-lg-3 col-6">
                        <div className="fact__item">
                           <h2 className="count"><Count number={item.count} />{item.count_text}</h2>
                           <p>{item.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Counter
