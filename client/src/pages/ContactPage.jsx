import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useConfig } from '../contexts/ConfigContext';

export default function ContactPage() {
  const { config } = useConfig();
  const address = config.address || '71 Ngũ Hành Sơn, Q. Ngũ Hành Sơn, TP. Đà Nẵng';
  const phone = config.hotline || '0236 3836 169';
  const email = config.email || 'tuyensinh@due.udn.vn';

  const info = [
    { icon: Phone, label: 'Điện thoại', value: phone, sub: 'Thứ 2 - Thứ 6, 7:30 - 17:00' },
    { icon: Mail, label: 'Email', value: email, sub: 'Phản hồi trong 24 giờ' },
    { icon: MapPin, label: 'Địa chỉ', value: address, sub: 'Cổng chính Trường Đại học Kinh tế' },
    { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 6', sub: '7:30 - 11:30, 13:30 - 17:00' },
  ];



  const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors bg-white';

  return (
    <div>
      <PageHeader
        title="Liên hệ"
        subtitle="Chúng tôi luôn sẵn sàng hỗ trợ bạn"
        breadcrumbs={[{ label: 'Liên hệ' }]}
      />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            {info.map((item, i) => (
              <div key={i} className="flex gap-5 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-base font-black text-slate-900 leading-tight">{item.value}</p>
                  <p className="text-xs text-slate-500 mt-1.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 bg-slate-100 h-80">
          <iframe
            title="DUE Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1134386!2d108.2196!3d16.0544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1svi!2svn!4v1"
            className="w-full h-full border-none"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
