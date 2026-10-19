import { Category } from '../types';

export const RESTAURANT_INFO = {
  name: 'ละมุนรส',
  nameEn: 'Lamunros Thai Cuisine',
  slogan: 'เสน่ห์สำรับไทย รสแท้จากครัวโบราณ สบายตาและอบอุ่นใจ',
  hours: 'เปิดบริการทุกวัน 10:30 - 21:30 น.',
  phone: '02-892-4567 / 081-992-3456',
  address: 'เลขที่ 88 ถนนสาทรเหนือ แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500',
  line: '@lamunros.thai',
  social: {
    facebook: 'facebook.com/lamunros.th',
    instagram: '@lamunros.thaidining'
  }
};

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'ทั้งหมด', nameEn: 'All Dishes', icon: '✦' },
  { id: 'mains', name: 'กับข้าว', nameEn: 'Main Dishes', icon: '🍲' },
  { id: 'drinks', name: 'เครื่องดื่ม', nameEn: 'Beverages', icon: '🍵' },
  { id: 'desserts', name: 'ขนมหนมหวาน', nameEn: 'Desserts', icon: '🍨' }
];

