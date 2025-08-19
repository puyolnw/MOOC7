import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../hooks/useAuthContext';

// API URL configuration  
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3301";

interface BannerData {
    id?: number;
    title: string;
    subtitle: string;
    description: string;
    main_image?: string;
    main_image_file_id?: string;
    instructor1_name: string;
    instructor1_image?: string;
    instructor1_image_file_id?: string;
    instructor2_name: string;
    instructor2_image?: string;
    instructor2_image_file_id?: string;
    background_image?: string;
    background_image_file_id?: string;
}

interface ImageItem {
    image_id: number;
    title: string;
    description?: string;
    file_id: string;
    file_name: string;
    file_size: number;
    category: string;
    tags?: string;
    created_at: string;
    updated_at: string;
    creator_name?: string;
}

interface ImageGalleryManagerProps {
}

const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = () => {
    const { user } = useAuthContext();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
    const [filter, setFilter] = useState({
        category: '',
        search: ''
    });

    useEffect(() => {
        fetchImages();
    }, [filter]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.category) params.append('category', filter.category);
            if (filter.search) params.append('search', filter.search);
            params.append('limit', '50');

            const response = await fetch(`${API_URL}/api/img?${params.toString()}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setImages(result.images);
                }
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ');
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (imageId: number) => {
        if (!user?.token) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        if (!confirm('คุณแน่ใจหรือไม่ที่ต้องการลบรูปภาพนี้?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/img/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    toast.success('ลบรูปภาพสำเร็จ');
                    fetchImages(); // รีเฟรชรายการ
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('เกิดข้อผิดพลาดในการลบรูปภาพ');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const updateImage = async (imageId: number, data: Partial<ImageItem>) => {
        if (!user?.token) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/img/${imageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    toast.success('แก้ไขข้อมูลรูปภาพสำเร็จ');
                    setEditingImage(null);
                    fetchImages(); // รีเฟรชรายการ
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    const getImageUrl = (fileId: string) => {
        return `${API_URL}/api/img/display/${fileId}`;
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div>
            {/* ฟิลเตอร์ */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label">🏷️ หมวดหมู่</label>
                    <select 
                        className="form-select"
                        value={filter.category}
                        onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">ทั้งหมด</option>
                        <option value="banner">Banner</option>
                        <option value="faq">FAQ</option>
                        <option value="about">About</option>
                        <option value="instructor">Instructor</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">🔍 ค้นหา</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาจากชื่อ, คำอธิบาย, หรือ tags..."
                        value={filter.search}
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
            </div>

            {/* รายการรูปภาพ */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {images.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info text-center">
                                ไม่พบรูปภาพ
                            </div>
                        </div>
                    ) : (
                        images.map((image) => (
                            <div key={image.image_id} className="col-lg-4 col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="position-relative">
                                        <img
                                            src={getImageUrl(image.file_id)}
                                            alt={image.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/assets/img/placeholder.png';
                                            }}
                                        />
                                        <div className="position-absolute top-0 end-0 p-2">
                                            <span className={`badge ${
                                                image.category === 'banner' ? 'bg-primary' :
                                                image.category === 'faq' ? 'bg-info' :
                                                image.category === 'about' ? 'bg-success' :
                                                image.category === 'instructor' ? 'bg-warning' :
                                                'bg-secondary'
                                            }`}>
                                                {image.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="card-body">
                                        <h6 className="card-title">{image.title}</h6>
                                        {image.description && (
                                            <p className="card-text small text-muted">{image.description}</p>
                                        )}
                                        
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <strong>Tags:</strong> {image.tags || 'ไม่มี'}
                                            </small>
                                        </div>
                                        
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <strong>ขนาด:</strong> {formatFileSize(image.file_size)}
                                            </small>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                <strong>อัปโหลดเมื่อ:</strong> {new Date(image.created_at).toLocaleDateString('th-TH')}
                                            </small>
                                        </div>
                                    </div>
                                    
                                    <div className="card-footer bg-transparent">
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-primary btn-sm flex-fill"
                                                onClick={() => setEditingImage(image)}
                                            >
                                                ✏️ แก้ไข
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm flex-fill"
                                                onClick={() => deleteImage(image.image_id)}
                                            >
                                                🗑️ ลบ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal แก้ไขรูปภาพ */}
            {editingImage && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">แก้ไขข้อมูลรูปภาพ</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setEditingImage(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <img
                                        src={getImageUrl(editingImage.file_id)}
                                        alt={editingImage.title}
                                        className="img-fluid rounded mb-3"
                                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">ชื่อรูปภาพ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingImage.title}
                                        onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">คำอธิบาย</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={editingImage.description || ''}
                                        onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">หมวดหมู่</label>
                                    <select
                                        className="form-select"
                                        value={editingImage.category}
                                        onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                                    >
                                        <option value="banner">Banner</option>
                                        <option value="faq">FAQ</option>
                                        <option value="about">About</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Tags</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="เช่น main,หลัก,banner (คั่นด้วยจุลภาค)"
                                        value={editingImage.tags || ''}
                                        onChange={(e) => setEditingImage({ ...editingImage, tags: e.target.value })}
                                    />
                                    <small className="text-muted">
                                        Tags ใช้สำหรับจับคู่รูปภาพกับตำแหน่งที่จะแสดงในเว็บไซต์
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditingImage(null)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => updateImage(editingImage.image_id, {
                                        title: editingImage.title,
                                        description: editingImage.description,
                                        category: editingImage.category,
                                        tags: editingImage.tags
                                    })}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ManagePics: React.FC = () => {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState<'banner' | 'faq' | 'about' | 'instructor' | 'gallery'>('banner');
    const defaultBannerData: BannerData = {
        title: 'อย่าหยุดการเรียนรู้ ชีวิต อย่าหยุด พัฒนา',
        subtitle: 'ทุกบทเรียนคือก้าวใหม่ เราพร้อมอยู่เคียงข้างคุณในทุกเส้นทาง',
        description: 'ลงทะเบียนตอนนี้',
        instructor1_name: 'ดร. วีระพน ภานุรักษ์',
        instructor2_name: 'อ. วินัย โกหลำ'
    };

    const [bannerData, setBannerData] = useState<BannerData>(defaultBannerData);
    const [originalBannerData, setOriginalBannerData] = useState<BannerData>(defaultBannerData);
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [previewImages, setPreviewImages] = useState<Record<string, string>>({});

    // สำหรับหน้าอื่นๆ
    const [pageConfigs, setPageConfigs] = useState<Record<string, any>>({
        faq: {},
        about: {},
        instructor: {}
    });

    // สำหรับแก้ไขข้อความหน้าอื่นๆ
    const [pageTextData, setPageTextData] = useState<Record<string, any>>({
        faq: {
            title: 'เริ่มต้นการเรียนรู้จาก <br /> อาจารย์ผู้สอนมืออาชีพ',
            subtitle: 'คำถามที่พบบ่อย'
        },
        about: {
            title: 'คลังหน่วยกิต<span>หลักสูตรออนไลน์</span><br />มหาวิทยาลัยราชภัฏมหาสารคาม',
            subtitle: 'เกี่ยวกับระบบ',
            description: 'ระบบคลังหน่วยกิตนี้ พัฒนาขึ้นโดยอาจารย์และบุคลากรภายในมหาวิทยาลัยราชภัฏมหาสารคาม เพื่อให้นักศึกษาสามารถเข้าถึงข้อมูลหลักสูตร วิชาที่เปิดสอน และพัฒนาการเรียนรู้อย่างเป็นระบบและยืดหยุ่นตามความถนัดของแต่ละคน',
            student_count: '36K+',
            student_text: 'Enrolled Students'
        },
        instructor: {
            title: 'อาจารย์ระดับชั้นนำและผู้เชี่ยวชาญของเรา',
            subtitle: 'แนะนำผู้มีทักษะ',
            instructor1_name: 'อาจารย์ ดร.วีระพน ภานุรักษ์',
            instructor1_designation: 'นำร่อง หลักสูตรแบบชุดวิชา',
            instructor2_name: 'อาจารย์ภาสกร ธนศิระธรรม',
            instructor2_designation: 'สาขาเทคโนโลยีสารสนเทศ',
            instructor3_name: 'อาจารย์ทรงพล นามคุณ',
            instructor3_designation: 'วิศวกรรมคอมพิวเตอร์',
            instructor4_name: 'ดร.ณพรรธนนท์ ทองปาน',
            instructor4_designation: 'สาขาเทคโนโลยีคอมพิวเตอร์และดิจิทัล'
        }
    });

    const [originalPageTextData, setOriginalPageTextData] = useState<Record<string, any>>({});
    const [pageChanges, setPageChanges] = useState<Record<string, boolean>>({});
    console.log(pageChanges)
    // โหลดข้อมูล Banner และหน้าอื่นๆ จาก API
    useEffect(() => {
        fetchBannerData();
        if (activeTab !== 'banner') {
            fetchPageConfig(activeTab);
        }
    }, [activeTab]);

    // ตั้งค่า originalPageTextData เมื่อแรกโหลด
    useEffect(() => {
        setOriginalPageTextData({ ...pageTextData });
    }, []);

    const fetchBannerData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/img/banner-config`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const config = result.banner_config;
                    const newBannerData = {
                        title: config.banner_title || bannerData.title,
                        subtitle: config.banner_subtitle || bannerData.subtitle,
                        description: config.banner_cta_text || bannerData.description,
                        instructor1_name: config.banner_instructor1_name || bannerData.instructor1_name,
                        instructor2_name: config.banner_instructor2_name || bannerData.instructor2_name,
                        main_image_file_id: config.main_image_file_id,
                        instructor1_image_file_id: config.instructor1_image_file_id,
                        instructor2_image_file_id: config.instructor2_image_file_id,
                        background_image_file_id: config.background_image_file_id
                    };

                    setBannerData(newBannerData);
                    setOriginalBannerData(newBannerData);
                }
            }
        } catch (error) {
            console.error('Error fetching banner data:', error);
        }
    };

    const fetchPageConfig = async (page: string) => {
        try {
            const response = await fetch(`${API_URL}/api/img/page-config?page=${page}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setPageConfigs(prev => ({
                        ...prev,
                        [page]: result.page_config
                    }));
                    
                    if (page === 'instructor') {
                        console.log('Instructor page config loaded:', result.page_config);
                    }

                    // อัปเดตข้อมูลข้อความจาก backend
                    const config = result.page_config;
                    const updatedTextData = { ...pageTextData[page] };
                    
                    Object.keys(config).forEach(key => {
                        if (!key.includes('_file_id')) {
                            updatedTextData[key] = config[key] || updatedTextData[key];
                        }
                    });

                    setPageTextData(prev => ({
                        ...prev,
                        [page]: updatedTextData
                    }));

                    setOriginalPageTextData(prev => ({
                        ...prev,
                        [page]: { ...updatedTextData }
                    }));
                }
            }
        } catch (error) {
            console.error(`Error fetching ${page} config:`, error);
        }
    };

    const handleInputChange = (field: keyof BannerData, value: string) => {
        setBannerData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (field: string, file: File, tags: string, category: string = 'banner') => {
        if (!user?.token) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        console.log('Uploading image:', { field, tags, category });
        setUploadingFiles(prev => ({ ...prev, [field]: true }));

        // สร้าง preview
        const previewUrl = URL.createObjectURL(file);
        setPreviewImages(prev => ({ ...prev, [field]: previewUrl }));

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', `${category} ${field}`);
            formData.append('description', field.includes('instructor1') ? bannerData.instructor1_name :
                field.includes('instructor2') ? bannerData.instructor2_name : `${category} ${field}`);
            formData.append('category', category);
            formData.append('tags', tags);

            // ใช้ endpoint สำหรับ banner หรือ general upload
            const endpoint = category === 'banner' ? 'banner-upload' : '';
            const uploadUrl = endpoint ? `${API_URL}/api/img/${endpoint}` : `${API_URL}/api/img`;

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    if (category === 'banner') {
                        setBannerData(prev => ({
                            ...prev,
                            [`${field}_file_id`]: result.file_id
                        }));
                    }
                    const replacedMessage = result.replaced_count > 0 ? ` (แทนที่รูปเก่า ${result.replaced_count} รูป)` : '';
                    toast.success(`อัปโหลดรูปภาพสำเร็จ${replacedMessage}`);

                    // รีเฟรชข้อมูลหน้าที่กำลังแก้ไข
                    if (category !== 'banner') {
                        await fetchPageConfig(category);
                        console.log('Refreshed pageConfigs for:', category);
                        console.log('New pageConfigs:', pageConfigs);
                    }

                    // Clear the preview image and reset file input after successful upload
                    setTimeout(() => {
                        setPreviewImages(prev => {
                            const newState = { ...prev };
                            delete newState[field];
                            return newState;
                        });
                        
                        // Reset the specific file input
                        const fileInput = document.querySelector(`input[type="file"][data-field="${field}"]`) as HTMLInputElement;
                        if (fileInput) {
                            fileInput.value = '';
                        }
                    }, 1000); // Give user a moment to see the success message
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('เกิดข้อผิดพลาดในการอัปโหลด');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
            // ลบ preview ถ้าอัปโหลดไม่สำเร็จ
            setPreviewImages(prev => {
                const newState = { ...prev };
                delete newState[field];
                return newState;
            });
        } finally {
            setUploadingFiles(prev => ({ ...prev, [field]: false }));
        }
    };

    const getImageUrl = (fileId?: string, fallbackPath?: string) => {
        if (fileId) {
            return `${API_URL}/api/img/display/${fileId}`;
        }
        return fallbackPath || '/assets/img/banner/banner_img.png';
    };

    const getChangesCount = () => {
        let changes = 0;
        const fields: (keyof BannerData)[] = [
            'title', 'subtitle', 'description', 'instructor1_name', 'instructor2_name',
            'main_image_file_id', 'instructor1_image_file_id', 'instructor2_image_file_id', 'background_image_file_id'
        ];

        fields.forEach(field => {
            const currentValue = bannerData[field] || '';
            const originalValue = originalBannerData[field] || '';
            if (currentValue !== originalValue) {
                changes++;
            }
        });

        // รวมการเปลี่ยนแปลงจาก preview images
        changes += Object.keys(previewImages).length;

        return changes;
    };

    const getPageChangesCount = (page: string) => {
        if (page === 'banner') return getChangesCount();
        
        let changes = 0;
        const currentData = pageTextData[page] || {};
        const originalData = originalPageTextData[page] || {};
        
        Object.keys(currentData).forEach(key => {
            const currentValue = currentData[key] || '';
            const originalValue = originalData[key] || '';
            if (currentValue !== originalValue) {
                changes++;
            }
        });
        
        // รวมการเปลี่ยนแปลงจาก preview images
        const pageImageChanges = Object.keys(previewImages).filter(key => 
            key.startsWith(page) || key.includes(page)
        ).length;
        
        return changes + pageImageChanges;
    };

    const resetFileInputs = () => {
        // Reset all file input values to allow re-selection of the same file
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input: Element) => {
            (input as HTMLInputElement).value = '';
        });
    };

    const resetChanges = () => {
        if (activeTab === 'banner') {
            setBannerData({ ...originalBannerData });
        } else {
            setPageTextData(prev => ({
                ...prev,
                [activeTab]: { ...originalPageTextData[activeTab] }
            }));
            setPageChanges(prev => ({ ...prev, [activeTab]: false }));
        }
        setPreviewImages({});
        // Also reset file inputs
        resetFileInputs();
    };

    const handlePageTextChange = (page: string, field: string, value: string) => {
        setPageTextData(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [field]: value
            }
        }));
        setPageChanges(prev => ({ ...prev, [page]: true }));
    };

    const saveChanges = async () => {
        if (!user?.token) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }

        try {
            if (activeTab === 'banner') {
                // บันทึกการตั้งค่าข้อความ Banner
                const settings = {
                    banner_title: bannerData.title,
                    banner_subtitle: bannerData.subtitle,
                    banner_cta_text: bannerData.description,
                    banner_instructor1_name: bannerData.instructor1_name,
                    banner_instructor2_name: bannerData.instructor2_name
                };

                const response = await fetch(`${API_URL}/api/img/banner-settings`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ settings })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        toast.success('บันทึกการเปลี่ยนแปลงสำเร็จ');
                        setOriginalBannerData(bannerData);
                        setPreviewImages({});
                        // Reset file inputs
                        resetFileInputs();
                    } else {
                        throw new Error(result.message);
                    }
                } else {
                    throw new Error('เกิดข้อผิดพลาดในการบันทึก');
                }
            } else {
            // บันทึกการตั้งค่าหน้าอื่นๆ
            const hasChanges = getPageChangesCount(activeTab) > 0;
            if (hasChanges) {
                    const settings = pageTextData[activeTab];
                        const response = await fetch(`${API_URL}/api/img/page-settings`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.token}`
                            },
                            body: JSON.stringify({ page: activeTab, settings })
                        });

                        if (response.ok) {
                            const result = await response.json();
                            if (result.success) {
                                toast.success('บันทึกการเปลี่ยนแปลงสำเร็จ');
                                setOriginalPageTextData(prev => ({
                                    ...prev,
                                    [activeTab]: { ...pageTextData[activeTab] }
                                }));
                                setPreviewImages({});
                                setPageChanges(prev => ({ ...prev, [activeTab]: false }));
                                // Reset file inputs
                                resetFileInputs();
                            } else {
                                throw new Error(result.message);
                            }
                        } else {
                            throw new Error('เกิดข้อผิดพลาดในการบันทึก');
                        }
                    } else {
                        toast.success('อัปโหลดรูปภาพสำเร็จ - รูปภาพจะถูกแสดงในหน้าเว็บไซต์โดยอัตโนมัติ');
                        setPreviewImages({});
                        // Reset file inputs
                        resetFileInputs();
                    }
                }
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h4 className="mb-0">🖼️ จัดการรูปภาพและเนื้อหา</h4>
                        </div>
                        <div className="card-body">
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'banner' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('banner')}
                                    >
                                        📄 หน้าแรก (Banner)
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('faq')}
                                    >
                                        ❓ คำถามที่พบบ่อย (FAQ)
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('about')}
                                    >
                                        ℹ️ เกี่ยวกับเรา (About)
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'instructor' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('instructor')}
                                    >
                                        👨‍🏫 อาจารย์ (Instructors)
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('gallery')}
                                    >
                                        🖼️ คลังรูปภาพ
                                    </button>
                                </li>
                            </ul>

                            {activeTab === 'banner' && (
                                <div>
                                    {/* แสดงสถิติการเปลี่ยนแปลง - ใช้สำหรับทุกแท็บ */}
                                    <div className={`alert d-flex justify-content-between align-items-center ${getPageChangesCount(activeTab) > 0 ? 'alert-warning' : 'alert-info'}`}>
                                    <div>
                                    📊 <strong>สถานะ:</strong> มีการเปลี่ยนแปลง {getPageChangesCount(activeTab)} รายการ
                                    <small className="d-block text-muted">
                                    {activeTab === 'banner' && (
                                        <>Preview Images: {Object.keys(previewImages).length} | Text Changes: {getChangesCount() - Object.keys(previewImages).length}</>
                                        )}
                                        {activeTab !== 'banner' && (
                                        <>รูปภาพ: {Object.keys(previewImages).filter(key => key.includes(activeTab)).length} | ข้อความ: {getPageChangesCount(activeTab) - Object.keys(previewImages).filter(key => key.includes(activeTab)).length}</>
                                        )}
                                    </small>
                                    {getPageChangesCount(activeTab) > 0 && (
                                        <span className="text-danger ms-2 fw-bold">⚠️ ยังไม่ได้บันทึก</span>
                                        )}
                                        {getPageChangesCount(activeTab) === 0 && (
                                        <span className="text-success ms-2">✅ ข้อมูลล่าสุด</span>
                                    )}
                                    </div>
                                    <div>
                                    <button
                                    className="btn btn-secondary btn-sm me-2"
                                        onClick={resetChanges}
                                        disabled={getPageChangesCount(activeTab) === 0}
                                    >
                                    🔄 รีเซ็ต
                                    </button>
                                    <button
                                    className="btn btn-success btn-sm"
                                        onClick={saveChanges}
                                            disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                        💾 บันทึก ({getPageChangesCount(activeTab)})
                                    </button>
                                </div>
                            </div>

                                    <div className="row">
                                        {/* แบบฟอร์มแก้ไข */}
                                        <div className="col-lg-6">
                                            <h5>🔧 แก้ไขเนื้อหา</h5>

                                            {/* ข้อความหลัก */}
                                            <div className="mb-3">
                                                <label className="form-label">📝 หัวข้อหลัก</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={bannerData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    placeholder="ป้อนหัวข้อหลัก..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📖 คำอธิบาย</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={2}
                                                    value={bannerData.subtitle}
                                                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                                    placeholder="ป้อนคำอธิบาย..."
                                                />
                                            </div>

                                            {/* รูปภาพหลัก */}
                                            <div className="mb-3">
                                                <label className="form-label">🖼️ รูปภาพหลัก</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="main_image"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('main_image', file, 'main,หลัก,banner');
                                                    }}
                                                    disabled={uploadingFiles.main_image}
                                                />
                                                {uploadingFiles.main_image && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>

                                            {/* อาจารย์คนที่ 1 */}
                                            <div className="mb-3">
                                                <label className="form-label">👨‍🏫 ชื่ออาจารย์คนที่ 1</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={bannerData.instructor1_name}
                                                    onChange={(e) => handleInputChange('instructor1_name', e.target.value)}
                                                    placeholder="ป้อนชื่ออาจารย์..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📷 รูปอาจารย์คนที่ 1</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="instructor1_image"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('instructor1_image', file, 'instructor1,อาจารย์1,banner');
                                                    }}
                                                    disabled={uploadingFiles.instructor1_image}
                                                />
                                                {uploadingFiles.instructor1_image && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>

                                            {/* อาจารย์คนที่ 2 */}
                                            <div className="mb-3">
                                                <label className="form-label">👩‍🏫 ชื่ออาจารย์คนที่ 2</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={bannerData.instructor2_name}
                                                    onChange={(e) => handleInputChange('instructor2_name', e.target.value)}
                                                    placeholder="ป้อนชื่ออาจารย์..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📷 รูปอาจารย์คนที่ 2</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="instructor2_image"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('instructor2_image', file, 'instructor2,อาจารย์2,banner');
                                                    }}
                                                    disabled={uploadingFiles.instructor2_image}
                                                />
                                                {uploadingFiles.instructor2_image && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ตัวอย่าง */}
                                        <div className="col-lg-6">
                                            <h5>👀 ตัวอย่างการแสดงผล</h5>
                                            <div className="border rounded p-3 bg-light" style={{ minHeight: '400px' }}>
                                                {/* รูปภาพหลัก */}
                                                <div className="text-center mb-3">
                                                    <img
                                                        src={previewImages.main_image || getImageUrl(bannerData.main_image_file_id, '/assets/img/banner/banner_img.png')}
                                                        alt="Main Banner"
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                    />
                                                    {previewImages.main_image && (
                                                        <div className="badge bg-warning text-dark mt-1">🔄 ใหม่</div>
                                                    )}
                                                </div>

                                                {/* ข้อความ */}
                                                <div className="mb-3">
                                                    <h6 className="text-primary">
                                                        {bannerData.title}
                                                        {bannerData.title !== originalBannerData.title && (
                                                            <span className="badge bg-warning text-dark ms-1">แก้ไข</span>
                                                        )}
                                                    </h6>
                                                    <p className="text-muted small">
                                                        {bannerData.subtitle}
                                                        {bannerData.subtitle !== originalBannerData.subtitle && (
                                                            <span className="badge bg-warning text-dark ms-1">แก้ไข</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* อาจารย์ */}
                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={previewImages.instructor1_image || getImageUrl(bannerData.instructor1_image_file_id, '/assets/img/banner/banner_author01.png')}
                                                                alt="Instructor 1"
                                                                className="rounded-circle me-2"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div>
                                                                <small className="fw-bold">{bannerData.instructor1_name}</small>
                                                                {previewImages.instructor1_image && (
                                                                    <div className="badge bg-warning text-dark">🔄</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={previewImages.instructor2_image || getImageUrl(bannerData.instructor2_image_file_id, '/assets/img/banner/banner_author02.png')}
                                                                alt="Instructor 2"
                                                                className="rounded-circle me-2"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div>
                                                                <small className="fw-bold">{bannerData.instructor2_name}</small>
                                                                {previewImages.instructor2_image && (
                                                                    <div className="badge bg-warning text-dark">🔄</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'faq' && (
                                <div>
                                    {/* แสดงสถานะการเปลี่ยนแปลง */}
                                    <div className={`alert d-flex justify-content-between align-items-center ${getPageChangesCount(activeTab) > 0 ? 'alert-warning' : 'alert-info'}`}>
                                        <div>
                                            📊 <strong>สถานะ:</strong> มีการเปลี่ยนแปลง {getPageChangesCount(activeTab)} รายการ
                                            <small className="d-block text-muted">
                                                รูปภาพ: {Object.keys(previewImages).filter(key => key.includes(activeTab)).length} | ข้อความ: {getPageChangesCount(activeTab) - Object.keys(previewImages).filter(key => key.includes(activeTab)).length}
                                            </small>
                                            {getPageChangesCount(activeTab) > 0 && (
                                                <span className="text-danger ms-2 fw-bold">⚠️ ยังไม่ได้บันทึก</span>
                                            )}
                                            {getPageChangesCount(activeTab) === 0 && (
                                                <span className="text-success ms-2">✅ ข้อมูลล่าสุด</span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-secondary btn-sm me-2"
                                                onClick={resetChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                🔄 รีเซ็ต
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={saveChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                💾 บันทึก ({getPageChangesCount(activeTab)})
                                            </button>
                                        </div>
                                    </div>

                                    <h5>❓ จัดการหน้าคำถามที่พบบ่อย</h5>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            {/* ฟิลด์แก้ไขข้อความ */}
                                            <div className="mb-3">
                                                <label className="form-label">📝 หัวข้อหลัก</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={pageTextData.faq?.title || ''}
                                                    onChange={(e) => handlePageTextChange('faq', 'title', e.target.value)}
                                                    placeholder="ป้อนหัวข้อหลัก FAQ..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📖 หัวข้อรอง</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={pageTextData.faq?.subtitle || ''}
                                                    onChange={(e) => handlePageTextChange('faq', 'subtitle', e.target.value)}
                                                    placeholder="ป้อนหัวข้อรอง FAQ..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">🖼️ รูปภาพหลัก FAQ</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="faq_main_image"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('faq_main_image', file, 'faq,main,หลัก', 'faq');
                                                    }}
                                                    disabled={uploadingFiles.faq_main_image}
                                                />
                                                {uploadingFiles.faq_main_image && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <h6>ตัวอย่างการแสดงผล</h6>
                                            <div className="border rounded p-3 bg-light">
                                                <img
                                                    src={previewImages.faq_main_image ||
                                                        (pageConfigs.faq?.main_image_file_id ?
                                                            getImageUrl(pageConfigs.faq.main_image_file_id) :
                                                            '/assets/img/others/faq_img.png')}
                                                    alt="FAQ"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                />
                                                {previewImages.faq_main_image && (
                                                    <div className="badge bg-warning text-dark mt-1">🔄 ใหม่</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div>
                                    {/* แสดงสถานะการเปลี่ยนแปลง */}
                                    <div className={`alert d-flex justify-content-between align-items-center ${getPageChangesCount(activeTab) > 0 ? 'alert-warning' : 'alert-info'}`}>
                                        <div>
                                            📊 <strong>สถานะ:</strong> มีการเปลี่ยนแปลง {getPageChangesCount(activeTab)} รายการ
                                            <small className="d-block text-muted">
                                                รูปภาพ: {Object.keys(previewImages).filter(key => key.includes(activeTab)).length} | ข้อความ: {getPageChangesCount(activeTab) - Object.keys(previewImages).filter(key => key.includes(activeTab)).length}
                                            </small>
                                            {getPageChangesCount(activeTab) > 0 && (
                                                <span className="text-danger ms-2 fw-bold">⚠️ ยังไม่ได้บันทึก</span>
                                            )}
                                            {getPageChangesCount(activeTab) === 0 && (
                                                <span className="text-success ms-2">✅ ข้อมูลล่าสุด</span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-secondary btn-sm me-2"
                                                onClick={resetChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                🔄 รีเซ็ต
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={saveChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                💾 บันทึก ({getPageChangesCount(activeTab)})
                                            </button>
                                        </div>
                                    </div>

                                    <h5>ℹ️ จัดการหน้าเกี่ยวกับเรา</h5>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            {/* ฟิลด์แก้ไขข้อความ */}
                                            <div className="mb-3">
                                                <label className="form-label">📝 หัวข้อหลัก</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={pageTextData.about?.title || ''}
                                                    onChange={(e) => handlePageTextChange('about', 'title', e.target.value)}
                                                    placeholder="ป้อนหัวข้อหลัก About..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📖 หัวข้อรอง</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={pageTextData.about?.subtitle || ''}
                                                    onChange={(e) => handlePageTextChange('about', 'subtitle', e.target.value)}
                                                    placeholder="ป้อนหัวข้อรอง About..."
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">📋 คำอธิบาย</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={4}
                                                    value={pageTextData.about?.description || ''}
                                                    onChange={(e) => handlePageTextChange('about', 'description', e.target.value)}
                                                    placeholder="ป้อนคำอธิบายหน้า About..."
                                                />
                                            </div>

                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">👥 จำนวนนักศึกษา</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={pageTextData.about?.student_count || ''}
                                                            onChange={(e) => handlePageTextChange('about', 'student_count', e.target.value)}
                                                            placeholder="เช่น 36K+"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">📚 ข้อความนักศึกษา</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={pageTextData.about?.student_text || ''}
                                                            onChange={(e) => handlePageTextChange('about', 'student_text', e.target.value)}
                                                            placeholder="เช่น Enrolled Students"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">🖼️ รูปภาพหลัก About</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="about_main_image"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('about_main_image', file, 'about,main,หลัก', 'about');
                                                    }}
                                                    disabled={uploadingFiles.about_main_image}
                                                />
                                                {uploadingFiles.about_main_image && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">👥 รูปกลุ่มนักศึกษา</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    data-field="about_student_group"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload('about_student_group', file, 'about,student,group,นักศึกษา', 'about');
                                                    }}
                                                    disabled={uploadingFiles.about_student_group}
                                                />
                                                {uploadingFiles.about_student_group && (
                                                    <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <h6>ตัวอย่างการแสดงผล</h6>
                                            <div className="border rounded p-3 bg-light">
                                                <div className="mb-2">
                                                    <small>รูปหลัก:</small>
                                                    <img
                                                        src={previewImages.about_main_image ||
                                                            (pageConfigs.about?.main_image_file_id ?
                                                                getImageUrl(pageConfigs.about.main_image_file_id) :
                                                                '/assets/img/others/about_img.png')}
                                                        alt="About"
                                                        className="img-fluid rounded d-block"
                                                        style={{ maxHeight: '150px', objectFit: 'cover' }}
                                                    />
                                                    {previewImages.about_main_image && (
                                                        <div className="badge bg-warning text-dark">🔄</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <small>กลุ่มนักศึกษา:</small>
                                                    <img
                                                        src={previewImages.about_student_group ||
                                                            (pageConfigs.about?.student_group_file_id ?
                                                                getImageUrl(pageConfigs.about.student_group_file_id) :
                                                                '/assets/img/others/student_grp.png')}
                                                        alt="Students"
                                                        className="img-fluid rounded d-block"
                                                        style={{ maxHeight: '100px', objectFit: 'cover' }}
                                                    />
                                                    {previewImages.about_student_group && (
                                                        <div className="badge bg-warning text-dark">🔄</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div>
                                    {/* แสดงสถานะการเปลี่ยนแปลง */}
                                    <div className={`alert d-flex justify-content-between align-items-center ${getPageChangesCount(activeTab) > 0 ? 'alert-warning' : 'alert-info'}`}>
                                        <div>
                                            📊 <strong>สถานะ:</strong> มีการเปลี่ยนแปลง {getPageChangesCount(activeTab)} รายการ
                                            <small className="d-block text-muted">
                                                รูปภาพ: {Object.keys(previewImages).filter(key => key.includes(activeTab)).length} | ข้อความ: {getPageChangesCount(activeTab) - Object.keys(previewImages).filter(key => key.includes(activeTab)).length}
                                            </small>
                                            {getPageChangesCount(activeTab) > 0 && (
                                                <span className="text-danger ms-2 fw-bold">⚠️ ยังไม่ได้บันทึก</span>
                                            )}
                                            {getPageChangesCount(activeTab) === 0 && (
                                                <span className="text-success ms-2">✅ ข้อมูลล่าสุด</span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-secondary btn-sm me-2"
                                                onClick={resetChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                🔄 รีเซ็ต
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={saveChanges}
                                                disabled={getPageChangesCount(activeTab) === 0}
                                            >
                                                💾 บันทึก ({getPageChangesCount(activeTab)})
                                            </button>
                                        </div>
                                    </div>

                                    <h5>👨‍🏫 จัดการหน้าอาจารย์</h5>
                                    
                                    {/* ฟิลด์แก้ไขหัวข้อหลัก */}
                                    <div className="row mb-4">
                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label className="form-label">📝 หัวข้อหลัก</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={2}
                                                    value={pageTextData.instructor?.title || ''}
                                                    onChange={(e) => handlePageTextChange('instructor', 'title', e.target.value)}
                                                    placeholder="ป้อนหัวข้อหลักหน้าอาจารย์..."
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label className="form-label">📖 หัวข้อรอง</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={pageTextData.instructor?.subtitle || ''}
                                                    onChange={(e) => handlePageTextChange('instructor', 'subtitle', e.target.value)}
                                                    placeholder="ป้อนหัวข้อรองหน้าอาจารย์..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-8">
                                            <div className="row">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <div key={num} className="col-lg-6 mb-4">
                                                        <div className="card h-100">
                                                            <div className="card-body">
                                                                <h6 className="card-title">👨‍🏫 อาจารย์คนที่ {num}</h6>
                                                                
                                                                <div className="mb-3">
                                                                    <label className="form-label">👤 ชื่ออาจารย์</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={pageTextData.instructor?.[`instructor${num}_name`] || ''}
                                                                        onChange={(e) => handlePageTextChange('instructor', `instructor${num}_name`, e.target.value)}
                                                                        placeholder={`ป้อนชื่ออาจารย์คนที่ ${num}...`}
                                                                    />
                                                                </div>

                                                                <div className="mb-3">
                                                                    <label className="form-label">🏢 ตำแหน่ง/สาขา</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={pageTextData.instructor?.[`instructor${num}_designation`] || ''}
                                                                        onChange={(e) => handlePageTextChange('instructor', `instructor${num}_designation`, e.target.value)}
                                                                        placeholder={`ป้อนตำแหน่งอาจารย์คนที่ ${num}...`}
                                                                    />
                                                                </div>

                                                                <div className="mb-3">
                                                                    <label className="form-label">📷 รูปอาจารย์คนที่ {num}</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            data-field={`instructor${num}_image`}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(`instructor${num}_image`, file, `instructor,instructor${num},อาจารย์${num}`, 'instructor');
                                                            }}
                                                            disabled={uploadingFiles[`instructor${num}_image`]}
                                                        />
                                                                    {uploadingFiles[`instructor${num}_image`] && (
                                                                        <div className="text-info mt-1">⏳ กำลังอัปโหลด...</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <h6>ตัวอย่างการแสดงผล</h6>
                                            <div className="border rounded p-3 bg-light">
                                                <div className="row">
                                                    {[1, 2, 3, 4].map((num) => (
                                                        <div key={num} className="col-6 mb-2">
                                                            <small>อาจารย์ {num}:</small>
                                                            <img
                                                                src={previewImages[`instructor${num}_image`] ||
                                                                    (pageConfigs.instructor?.[`instructor${num}_image_file_id`] ?
                                                                        getImageUrl(pageConfigs.instructor[`instructor${num}_image_file_id`]) :
                                                                        `/assets/img/instructor/instructor00${num}.png`)}
                                                                alt={`Instructor ${num}`}
                                                                className="img-fluid rounded d-block"
                                                                style={{ maxHeight: '80px', objectFit: 'cover' }}
                                                            />
                                                            {previewImages[`instructor${num}_image`] && (
                                                                <div className="badge bg-warning text-dark">🔄</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gallery' && (
                                <div>
                                    <h5>🖼️ คลังรูปภาพทั้งหมด</h5>
                                    <p className="text-muted">แสดงรูปภาพทั้งหมดในระบบ สามารถลบหรือแก้ไขได้</p>
                                    
                                    <div className="alert alert-info">
                                        <h6>🔍 วิธีการใช้งาน:</h6>
                                        <ul className="mb-0">
                                            <li>รูปภาพแต่ละรูปจะแสดงพร้อมกับ <strong>Tags</strong> และ <strong>Category</strong></li>
                                            <li>รูปที่มี tags ตรงกัน เมื่ออัปโหลดรูปใหม่จะแทนที่รูปเก่า</li>
                                            <li>สามารถลบหรือแก้ไขข้อมูลรูปภาพได้โดยตรง</li>
                                            <li>รูปภาพจะปรากฏในหน้าเว็บไซต์ตาม category และ tags ที่กำหนด</li>
                                        </ul>
                                    </div>

                                    <ImageGalleryManager />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePics;
