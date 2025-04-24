
interface BlogProps {
   style: boolean;
}

const Blog = ({ style }: BlogProps) => {
   return (
      <section className={`blog__post-area ${style ? "blog__post-area-two" : ""}`}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-6">
                  <div className="section__title text-center mb-40">
                     <span className="sub-title">ข่าวสารและบล็อก</span>
                     <h2 className="title">ข่าวสารล่าสุดของเรา</h2>
                     {/* <p>when known printer took a galley of type scrambl edmake</p> */}
                  </div>
               </div>
            </div>


         </div>
      </section>
   )
}

export default Blog
