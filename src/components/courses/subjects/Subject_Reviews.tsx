
interface ReviewsProps {
  subject_id: number;
}

const Reviews = ({}: ReviewsProps) => {
  return (
    <div className="courses__reviews-wrap">
      <h3 className="title">รีวิวจากผู้เรียน</h3>
      
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        ยังไม่มีรีวิวสำหรับรายวิชานี้
      </div>
      
      <div className="add-review-form">
        <h4 className="title">เขียนรีวิวของคุณ</h4>
        <form action="#">
          <div className="row">
            <div className="col-md-6">
              <div className="form-grp">
                <input type="text" placeholder="ชื่อของคุณ *" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-grp">
                <input type="email" placeholder="อีเมลของคุณ *" />
              </div>
            </div>
          </div>
          <div className="form-grp">
            <textarea name="message" placeholder="เขียนรีวิวของคุณที่นี่..."></textarea>
          </div>
          <div className="form-grp rating-form-grp">
            <span>ให้คะแนน</span>
            <div className="grade-rating">
              <div className="rating-wrap">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
          </div>
          <button type="submit" className="btn">ส่งรีวิว</button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;
