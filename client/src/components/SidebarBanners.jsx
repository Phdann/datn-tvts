import { useState, useEffect } from 'react';
import { bannerService } from '../services';

export default function SidebarBanners() {
    const [banners, setBanners] = useState([]);
    useEffect(() => {
        bannerService.getBanners({ is_active: true, position: 'sidebar' })
            .then(data => setBanners(Array.isArray(data) ? data : []))
            .catch(() => setBanners([]));
    }, []);

    if (!banners.length) return null;

    return (
        <div className="space-y-4">
            {banners.map(b => (
                <a key={b.id} href={b.link_url || '#'} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={b.image_url} alt={b.title} className="w-full h-auto object-cover rounded-md shadow" />
                </a>
            ))}
        </div>
    );
}
