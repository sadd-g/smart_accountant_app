export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    appName: 'دفتر المحاسب الذكي',
    login: { title: 'دفتر المحاسب الذكي', subtitle: 'نظام محاسبة ذكي', pinPlaceholder: 'أدخل رمز PIN', loginBtn: 'تسجيل الدخول', fingerprint: 'تسجيل بالبصمة', wrongPin: 'رمز PIN غير صحيح', developer: 'م/ صدام بشير' },
    dashboard: { title: 'لوحة التحكم', welcome: 'مرحباً' },
    common: { add: 'إضافة', search: 'بحث', edit: 'تعديل', delete: 'حذف', save: 'حفظ', print: 'طباعة', cancel: 'إلغاء', confirm: 'تأكيد', noData: 'لا توجد بيانات', loading: 'جاري التحميل...', success: 'تم بنجاح', error: 'خطأ' },
    settings: { title: 'الإعدادات', profile: 'الملف الشخصي', security: 'الأمان', backup: 'النسخ الاحتياطي', advanced: 'متقدم', logout: 'تسجيل الخروج' },
  },
  en: {
    appName: 'Smart Accountant',
    login: { title: 'Smart Accountant', subtitle: 'Intelligent Accounting', pinPlaceholder: 'Enter PIN', loginBtn: 'Login', fingerprint: 'Fingerprint', wrongPin: 'Wrong PIN', developer: 'Eng. Saddam Bashir' },
    dashboard: { title: 'Dashboard', welcome: 'Welcome' },
    common: { add: 'Add', search: 'Search', edit: 'Edit', delete: 'Delete', save: 'Save', print: 'Print', cancel: 'Cancel', confirm: 'Confirm', noData: 'No Data', loading: 'Loading...', success: 'Success', error: 'Error' },
    settings: { title: 'Settings', profile: 'Profile', security: 'Security', backup: 'Backup', advanced: 'Advanced', logout: 'Logout' },
  },
};
