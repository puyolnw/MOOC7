# Score Management System Logic Documentation

## 📊 Overview
ระบบจัดการคะแนนแบบ Hierarchical สำหรับหลักสูตรออนไลน์ที่แสดงผลเป็นเปอร์เซ็นต์สัดส่วนในหน้า Frontend แต่เก็บข้อมูลเป็นคะแนนดิบใน Backend

## 🎯 Core Principles

### 1. **คะแนนรวม = 100 คะแนน**
- ระบบต้องมีคะแนนรวม 100 คะแนนพอดี
- ไม่เกิน ไม่ขาด ต้องเท่ากับ 100 คะแนนเสมอ

### 2. **การเก็บคะแนนจริง**
- **วิดีโอ/เอกสาร**: ไม่เก็บคะแนน (0 คะแนน)
- **แบบทดสอบ**: เก็บคะแนนจริงทั้งหมด
- **หน่วยการเรียน**: กระจายคะแนนตาม weight_percentage

### 3. **การแสดงผล Dual Mode**
- **Frontend**: แสดงเปอร์เซ็นต์สัดส่วนภายในแต่ละระดับ (relative %)
- **Backend**: เก็บคะแนนดิบ (raw score) สำหรับการคำนวณจริง

## 📋 Data Structure

### Subject Structure
```json
{
  "subject": {
    "subject_id": 1,
    "subject_name": "พื้นฐานการเขียนโปรแกรม",
    "passing_percentage": 80,
    "total_score": 100
  }
}
```

### Score Structure (Raw Data - Backend)
```json
{
  "scoreStructure": {
    "pre_test": {
      "id": 1,
      "title": "แบบทดสอบก่อนเรียน",
      "score": 0
    },
    "big_lessons": [
      {
        "id": 1,
        "title": "บทนำและแนวคิดพื้นฐาน",
        "weight_percentage": 25,
        "quiz": {
          "id": 101,
          "percentage": 10
        },
        "lessons": [
          {
            "id": 201,
            "title": "ความรู้เบื้องต้น",
            "percentage": 0,
            "has_video": true,
            "quiz": {
              "id": 301,
              "percentage": 12
            }
          }
        ]
      }
    ],
    "post_test": {
      "id": 2,
      "title": "แบบทดสอบหลังเรียน",
      "percentage": 25
    }
  }
}
```

## ⚙️ Logic Rules

### 1. **Score Distribution Logic**
```javascript
// หลักการกระจายคะแนน
totalScore = 100;
bigLessonsScore = sum(big_lessons[].weight_percentage);
postTestScore = post_test.percentage;
preTestScore = 0; // ไม่นับคะแนน

// ต้องเท่ากับ 100
bigLessonsScore + postTestScore === 100
```

### 2. **Lesson Score Logic**
```javascript
// กฎการเก็บคะแนนในบทเรียน
lesson.percentage = 0; // วิดีโอไม่เก็บคะแนน
lesson.quiz.percentage = totalLessonScore; // คะแนนทั้งหมดไปที่ quiz

// ตัวอย่าง: บทเรียนมีคะแนน 12
lesson.percentage = 0;
lesson.quiz.percentage = 12;
```

### 3. **Relative Percentage Logic**
```javascript
// การแปลงเป็นสัดส่วนสำหรับแสดงผล
function convertToRelativePercentage(bigLesson) {
    const totalRaw = (bigLesson.quiz?.percentage || 0) + 
        bigLesson.lessons.reduce((sum, lesson) => 
            sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0
        );
    
    // แบบทดสอบหน่วย
    if (bigLesson.quiz) {
        bigLesson.quiz.relative_percentage = 
            Math.round((bigLesson.quiz.percentage / totalRaw) * 100);
    }
    
    // บทเรียน
    bigLesson.lessons.forEach(lesson => {
        const lessonTotal = lesson.percentage + (lesson.quiz?.percentage || 0);
        lesson.relative_percentage = 
            Math.round((lessonTotal / totalRaw) * 100);
        
        // Quiz ของบทเรียนเป็น 100% เสมอ (เพราะคะแนนทั้งหมดอยู่ที่นี่)
        if (lesson.quiz) {
            lesson.quiz.relative_percentage = 100;
        }
    });
}
```

### 4. **Conversion Back to Raw Score**
```javascript
// การแปลงจาก relative กลับเป็นคะแนนดิบ
function convertToRawScore(bigLesson) {
    const items = [];
    if (bigLesson.quiz) items.push({type: 'quiz', item: bigLesson.quiz});
    
    bigLesson.lessons.forEach(lesson => {
        items.push({type: 'lesson', item: lesson});
    });
    
    const totalRelative = items.reduce((sum, item) => 
        sum + (item.item.relative_percentage || 0), 0);
    
    items.forEach(({type, item}) => {
        const proportion = (item.relative_percentage || 0) / totalRelative;
        const rawScore = bigLesson.weight_percentage * proportion;
        
        if (type === 'quiz') {
            item.percentage = rawScore;
        } else if (type === 'lesson') {
            item.percentage = 0; // วิดีโอไม่เก็บคะแนน
            if (item.quiz) {
                item.quiz.percentage = rawScore; // คะแนนทั้งหมดไปที่ quiz
            }
        }
    });
}
```

## 🎨 Frontend Display Logic

### 1. **การแสดงผลในหน้าเว็บ**
```
วิชา: พื้นฐานการเขียนโปรแกรม (100 คะแนน)
📈 สรุป: 100 คะแนน (จากทั้งหมด 100 คะแนน) ✅

├── ก่อนเรียน = 0 คะแนน (ไม่นับคะแนน)
├── หน่วยที่ 1: บทนำและแนวคิดพื้นฐาน
│   คะแนนดิบ: 25 คะแนน | ▓▓▓▓▓▓▓▓▓▓ 100%
│   ├── แบบทดสอบหน่วย (40% ของหน่วย)
│   │   💾 เก็บคะแนนจริง: 10 คะแนน
│   ├── บทเรียนที่ 1 (60% ของหน่วย)
│   │   วิดีโอ (0 คะแนน) + แบบทดสอบ | รวม: 15 คะแนน
│   │   └── แบบทดสอบ (100% ของบทเรียน)
│   │       💾 เก็บคะแนนจริง: 15 คะแนน
└── แบบทดสอบหลังเรียน
    💾 เก็บคะแนนจริง: 75 คะแนน
```

### 2. **Progress Bar Logic**
```javascript
function createProgressBar(usedScore, totalScore, status) {
    const percentage = (usedScore / totalScore) * 100;
    
    const colors = {
        'complete': 'linear-gradient(90deg, #28a745, #20c997)',
        'incomplete': 'linear-gradient(90deg, #ffc107, #fd7e14)',
        'exceeded': 'linear-gradient(90deg, #dc3545, #e74c3c)'
    };
    
    return {
        width: `${Math.min(percentage, 100)}%`,
        background: colors[status],
        text: `${Math.round(percentage)}% (${usedScore}/${totalScore} คะแนน)`
    };
}
```

## 📊 Validation Rules

### 1. **คะแนนรวมต้องเป็น 100**
```javascript
function validateTotalScore(scoreStructure) {
    const totalUsed = scoreStructure.big_lessons.reduce((sum, bl) => 
        sum + bl.weight_percentage, 0) + (scoreStructure.post_test?.percentage || 0);
    
    return {
        isValid: totalUsed === 100,
        totalUsed: totalUsed,
        errors: totalUsed !== 100 ? 
            [`${totalUsed > 100 ? 'เกิน' : 'ไม่ครบ'} 100 คะแนน (${totalUsed} คะแนน)`] : []
    };
}
```

### 2. **หน่วยการเรียนต้องกระจายคะแนนครบ**
```javascript
function validateBigLessonDistribution(bigLesson) {
    const usedScore = (bigLesson.quiz?.percentage || 0) + 
        bigLesson.lessons.reduce((sum, lesson) => 
            sum + lesson.percentage + (lesson.quiz?.percentage || 0), 0);
    
    return {
        isValid: Math.abs(usedScore - bigLesson.weight_percentage) < 0.01,
        usedScore: usedScore,
        targetScore: bigLesson.weight_percentage,
        status: usedScore === bigLesson.weight_percentage ? 'complete' : 
                usedScore > bigLesson.weight_percentage ? 'exceeded' : 'incomplete'
    };
}
```

## 🔄 API Integration

### 1. **Data Flow**
```
Frontend Input (Relative %) → Convert to Raw Score → Send to Backend
Backend Response (Raw Score) → Convert to Relative % → Display Frontend
```

### 2. **API Payload Structure**
```json
{
  "updates": {
    "big_lessons": [
      {
        "id": 1,
        "weight_percentage": 25,
        "quiz": {
          "id": 101,
          "percentage": 10
        },
        "lessons": [
          {
            "id": 201,
            "percentage": 0,
            "quiz": {
              "id": 301,
              "percentage": 15
            }
          }
        ]
      }
    ],
    "post_test": {
      "id": 2,
      "percentage": 75
    }
  }
}
```

## 🎯 Implementation Guidelines

### 1. **Frontend Implementation**
- ใช้ `convertRawToRelativePercentage()` เมื่อแสดงผล
- ใช้ `convertRelativeToRawPercentage()` เมื่อบันทึกข้อมูล
- อัปเดต progress bar ทุกครั้งที่มีการเปลี่ยนแปลง

### 2. **Backend Implementation**
- เก็บข้อมูลเป็นคะแนนดิบเสมอ
- ตรวจสอบผลรวมคะแนนต้องเป็น 100
- ไม่เก็บ relative_percentage ในฐานข้อมูล

### 3. **Error Handling**
- แสดงข้อผิดพลาดเมื่อคะแนนไม่ครบ 100
- แสดง warning เมื่อมีการเปลี่ยนแปลงที่ส่งผลต่อคะแนนรวม
- ป้องกันการบันทึกข้อมูลที่ไม่ถูกต้อง

## 📈 Example Scenarios

### Scenario 1: วิชาที่มี 3 หน่วย + Post Test
```
หน่วยที่ 1: 30 คะแนน (Quiz หน่วย 10 + บทเรียน 20)
หน่วยที่ 2: 25 คะแนน (Quiz หน่วย 15 + บทเรียน 10)
หน่วยที่ 3: 20 คะแนน (เฉพาะบทเรียน 20)
Post Test: 25 คะแนน
รวม: 100 คะแนน ✅
```

### Scenario 2: การปรับสัดส่วน
```
เดิม: หน่วยที่ 1 มี Quiz 40% + บทเรียน 60%
แก้เป็น: หน่วยที่ 1 มี Quiz 30% + บทเรียน 70%

คะแนนดิบจะถูกปรับอัตโนมัติ:
Quiz: 30 คะแนน → 9 คะแนน
บทเรียน: 70 คะแนน → 21 คะแนน
```

## 🚀 Future Enhancements

1. **Auto-Balance**: ปรับคะแนนอัตโนมัติเมื่อเกิน/ขาด 100
2. **Template System**: เทมเพลตการกระจายคะแนนมาตรฐาน
3. **History Tracking**: ติดตามการเปลี่ยนแปลงคะแนน
4. **Bulk Operations**: แก้ไขหลายวิชาพร้อมกัน

---

**หมายเหตุ**: Documentation นี้เป็นข้อมูลอ้างอิงสำหรับการพัฒนาและดูแลรักษาระบบ Score Management
