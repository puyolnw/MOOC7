import { Link } from "react-router-dom"

const BlogAuthor = () => {
   return (
      <div className="blog__post-author">
         <div className="blog__post-author-thumb">
            <Link to="#"><img src="/assets/img/blog/author.png" alt="img" /></Link>
         </div>
         <div className="blog__post-author-content">
            <span className="designation">ผู้เขียน</span>
            <h5 className="name">Brooklyn Simmons</h5>
            <p>เราขอขอบคุณในความไว้วางใจของคุณเป็นอย่างมาก ลูกค้าของเราเลือก dentace ducts a curae in tristique liberois ultrices diamraesent varius diam dui. ชั้นเรียนเหมาะสมคู่หูเงียบและบิดไปที่ชายฝั่ง</p>
         </div>
      </div>
   )
}

export default BlogAuthor
