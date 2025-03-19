import { Link } from "react-router-dom"

const BlogPostComment = () => {
   return (
      <div className="comment-wrap">
         <div className="comment-wrap-title">
            <h4 className="title">02 ความคิดเห็น</h4>
         </div>
         <div className="latest-comments">
            <ul className="list-wrap">
               <li>
                  <div className="comments-box">
                     <div className="comments-avatar">
                        <img src="/assets/img/blog/comment01.png" alt="img" />
                     </div>
                     <div className="comments-text">
                        <div className="avatar-name">
                           <h6 className="name">Jessica Rose</h6>
                           <span className="date">20 July, 2024</span>
                        </div>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่คุณไม่ควรดื่มน้ำสกปรกเสมอไป เมื่อและเว้นแต่ประตู, malesuada risus nonVestibulum ante ipsum primis Maximus ligula eleifend id nisl quis interdum. </p>
                        <div className="comment-reply">
                           <Link to="#" className="comment-reply-link">การตอบกลับ</Link>
                        </div>
                     </div>
                  </div>
               </li>
               <li>
                  <div className="comments-box">
                     <div className="comments-avatar">
                        <img src="/assets/img/blog/comment02.png" alt="img" />
                     </div>
                     <div className="comments-text">
                        <div className="avatar-name">
                           <h6 className="name">Parker Willy</h6>
                           <span className="date">20 July, 2024</span>
                        </div>
                        <p>Maximus ligula eleifend id nisl ซึ่งบางครั้ง แต่การที่คนใจร้ายดื่มเหล้าก็ไม่ได้น่าเกลียดเสมอไป และนอกจากประตูแล้ว เสียงหัวเราะอันชั่วร้ายก็ไม่ใช่ประตูทางเข้าก่อนเป็นอันดับแรก</p>
                        <div className="comment-reply">
                           <Link to="#" className="comment-reply-link">การตอบกลับ</Link>
                        </div>
                     </div>
                  </div>
               </li>
            </ul>
         </div>
      </div>
   )
}

export default BlogPostComment
