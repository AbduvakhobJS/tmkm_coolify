// export const factoryModels = ['/models/factory3.glb', '/models/factory2.glb', '/models/factory.glb'];
//
// export const factoryData = [
//     { id: 1, side: 'left', position: [108, -44, 17], scale: 0.06, factory_model: factoryModels[0], title: 'Zavod №1', content: 'Asosiy ishlab chiqarish sexi.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', link: '#', modalHeight :  55 },
//     { id: 2, side: 'left', position: [40, -44, 30], scale: 0.045, factory_model: factoryModels[1], title: 'Mining Site A', content: 'Qazilma boyliklar qazib olish.', img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400', link: '#', modalHeight :  55 },
//     { id: 3, side: 'left', position: [20, -44, 15], scale: 0.025, factory_model: factoryModels[2], title: 'Zavod №2', content: 'Qayta ishlash markazi.', img: 'https://images.unsplash.com/photo-1565374395421-48243c8a6296?w=400', link: '#', modalHeight :  55 },
//     { id: 4, side: 'right', position: [-20, -44, -10], scale: 0.06, factory_model: factoryModels[0], title: 'Logistika Markazi', content: 'Mahsulotlarni yetkazib berish.', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', link: '#', modalHeight :  55 },
//     { id: 5, side: 'right', position: [0, -44, 15], scale: 0.045, factory_model: factoryModels[1], title: 'Zavod №3', content: 'Energetika majmuasi.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400', link: '#', modalHeight :  55 },
//     { id: 6, side: 'right', position: [5, -44, 40], scale: 0.025, factory_model: factoryModels[2], title: 'Laboratoriya', content: 'Sifat nazorati va tadqiqot.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', link: '#', modalHeight :  55 },
//     { id: 7, side: 'top', position: [-50, -44, -5], scale: 0.06, factory_model: factoryModels[0], title: 'Zavod №4', content: 'Tayyorlov bo\'limi.', img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400', link: '#', modalHeight :  55 },
//     { id: 8, side: 'top', position: [-5, -44, -17], scale: 0.045, factory_model: factoryModels[1], title: 'Sklad A', content: 'Xom-ashyo ombori.', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', link: '#', modalHeight :  55 },
//     { id: 9, side: 'top', position: [20, -44, 55], scale: 0.025, factory_model: factoryModels[2], title: 'Zavod №5', content: 'Yig\'uv liniyasi.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', link: '#', modalHeight :  55 }
// ];
// hozirda aylana chiqarmoqdasan bu aylanani kattaligi esa map2.glb bilan bir xil bo'lib qolmoqda, tushunishing uchun ikonlar map2.glb ga ikon qilib qo'yilgan kichkina qilib, ham bu effect bo'lmaydi, 1-dan effectga position va scale degan 2 ta field qo'sh `factoryData` ga , va ustun shaklida vertikal ham qilib qo'y
export const factoryModels = [
    '/models/factory3.glb',
    '/models/factory2.glb',
    '/models/factory.glb'
];

export const mapModels = [
    '/models/factory.glb',
    '/models/factory2.glb',
    '/models/factory3.glb'
];

export const factoryData = [
    {
        id: 1, side: 'right',
        position: [108, -44, 17] as [number,number,number],
        coords: [66.729483, 40.278469],
        marker_icon: "toifa_1",
        map_model: mapModels[0],
        map_model_scale: 0.025,
        factory_model: factoryModels[0],
        factory_model_scale: 0.025,
        title: 'Zavod №1',
        enterprise_name: "Navoiy kon-metallurgiya kombinati",
        projectGoal: "Loyiha markazi",
        status: "Loyiha holati",
        content: 'Asosiy ishlab chiqarish sexi.',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  45,
        modalPosition: [120, 50, -10] as [number, number, number]
    },
    {
        id: 2, side: 'left',
        position: [40, -44, 30] as [number,number,number],
        coords: [66.95, 40.10],
        marker_icon: "toifa_2",
        map_model: mapModels[1],
        map_model_scale: 0.045,
        factory_model: factoryModels[1],
        factory_model_scale: 0.05,
        title: 'Mining Site',
        enterprise_name: "Olmaliq kon-metallurgiya kombinati",
        projectGoal: "Qazib olish texnologiyasi",
        status: "Ish jarayonida",
        content: 'Qazilma boyliklar qazib olish.',
        img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400',
        link: '#', modalHeight :  60,
        modalPosition: [80, 70, 40] as [number, number, number]
    },
    {
        id: 3, side: 'left',
        position: [20, -44, 15] as [number,number,number],
        coords: [67.10, 40.35],
        marker_icon: "toifa_3",
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.005,
        title: 'Zavod №2',
        enterprise_name: "O'zbekneftgaz",
        projectGoal: "Qayta ishlash",
        status: "Tugallangan",
        content: 'Qayta ishlash markazi.',
        img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
        link: '#', modalHeight :  52,
        modalPosition: [50, 60, 20] as [number, number, number]
    },
    {
        id: 4, side: 'top',
        position: [-20, -44, -10] as [number,number,number],
        map_model: mapModels[0],
        map_model_scale: 0.025,
        factory_model: factoryModels[0],
        factory_model_scale: 0.025,
        title: 'Logistika Markazi',
        content: 'Mahsulotlarni yetkazish.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        link: '#', modalHeight :  45,
        modalPosition: [-100, 50, -20] as [number, number, number]
    },
    {
        id: 5, side: 'right',
        position: [0, -44, 15] as [number,number,number],
        map_model: mapModels[1],
        map_model_scale: 0.045,
        factory_model: factoryModels[1],
        factory_model_scale: 0.05,
        title: 'Zavod №3',
        content: 'Energetika majmuasi.',
        img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
        link: '#', modalHeight :  50,
        modalPosition: [-50, 60, 30] as [number, number, number]
    },
    {
        id: 6, side: 'top',
        position: [5, -44, 40] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: 'Laboratoriya',
        content: 'Sifat nazorati va tadqiqot.',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [-30, 70, 60] as [number, number, number]
    },
    {
        id: 7, side: 'top',
        position: [-50, -44, -5] as [number,number,number],
        map_model: mapModels[0],
        map_model_scale: 0.025,
        factory_model: factoryModels[0],
        factory_model_scale: 0.025,
        title: 'Zavod №4',
        content: "Tayyorlov bo'limi.",
        img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [-80, 80, -50] as [number, number, number]
    },
    {
        id: 8, side: 'top',
        position: [-5, -44, -17] as [number,number,number],
        map_model: mapModels[1],
        map_model_scale: 0.045,
        factory_model: factoryModels[1],
        factory_model_scale: 0.05,
        title: 'Sklad A',
        content: 'Xom-ashyo ombori.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        link: '#', modalHeight :  70,
        modalPosition: [-20, 100, -60] as [number, number, number]
    },
    {
        id: 9, side: 'top',
        position: [20, -44, 55] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: "Zavod №5",
        content: "Yig'uv liniyasi.",
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [60, 90, 80] as [number, number, number]
    },
    {
        id: 10, side: 'top',
        position: [-20, -44, -10] as [number,number,number],
        map_model: mapModels[0],
        map_model_scale: 0.025,
        factory_model: factoryModels[0],
        factory_model_scale: 0.025,
        title: 'Logistika Markazi',
        content: 'Mahsulotlarni yetkazish.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        link: '#', modalHeight :  45,
        modalPosition: [-100, 50, -20] as [number, number, number]
    },
    {
        id: 11, side: 'right',
        position: [0, -44, 15] as [number,number,number],
        map_model: mapModels[1],
        map_model_scale: 0.045,
        factory_model: factoryModels[1],
        factory_model_scale: 0.05,
        title: 'Zavod №3',
        content: 'Energetika majmuasi.',
        img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
        link: '#', modalHeight :  50,
        modalPosition: [-50, 60, 30] as [number, number, number]
    },
    {
        id: 12, side: 'top',
        position: [5, -44, 40] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: 'Laboratoriya',
        content: 'Sifat nazorati va tadqiqot.',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [-30, 70, 60] as [number, number, number]
    },

    {
        id: 17, side: 'bottom',
        position: [5, -44, 40] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: 'Laboratoriya',
        content: 'Sifat nazorati va tadqiqot.',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [-30, 70, 60] as [number, number, number]
    },
    {
        id: 18, side: 'bottom',
        position: [-50, -44, -5] as [number,number,number],
        map_model: mapModels[0],
        map_model_scale: 0.025,
        factory_model: factoryModels[0],
        factory_model_scale: 0.025,
        title: 'Zavod №4',
        content: "Tayyorlov bo'limi.",
        img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [-80, 80, -50] as [number, number, number]
    },
    {
        id: 20, side: 'bottom',
        position: [20, -44, 55] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: "Zavod №5",
        content: "Yig'uv liniyasi.",
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [60, 90, 80] as [number, number, number]
    },
    {
        id: 21, side: 'bottom',
        position: [20, -44, 55] as [number,number,number],
        map_model: mapModels[2],
        map_model_scale: 0.06,
        factory_model: factoryModels[2],
        factory_model_scale: 0.05,
        title: "Zavod №5",
        content: "Yig'uv liniyasi.",
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        link: '#', modalHeight :  55,
        modalPosition: [60, 90, 80] as [number, number, number]
    }
];