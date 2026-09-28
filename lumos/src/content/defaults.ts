import type { Copy, SiteContent } from './types'

const en: Copy = {
  meta: {
    title: 'Lumos Global Education — Study in Dubai',
    description:
      'Created by students, from admission to graduation. Lumos Global Education helps you choose a program, apply to university in Dubai and settle into student life.',
  },
  nav: {
    home: 'Home',
    packages: 'Packages',
    about: 'About us',
    application: 'Application',
    contact: 'Contact',
    startApplication: 'Start your application',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    menu: 'Menu',
  },
  hero: {
    eyebrow: 'Lumos Global Education, Dubai',
    line1: 'Created by students',
    line2: 'From admission to graduation',
    description:
      "Study in Dubai with guidance from people who have been through it themselves. We'll help you choose a program, apply to university, and settle into student life.",
    cta: 'Book a free consultation',
  },
  why: {
    label: 'Why Lumos',
    items: [
      {
        title: "We've been in your shoes",
        text: "Founded by a CUD graduate who knows what it's like to move to Dubai for university.",
      },
      {
        title: 'Guidance made personal',
        text: 'We help you choose a program that fits your goals, budget, and plans.',
      },
      {
        title: 'Support beyond admission',
        text: "From your application to your arrival in the UAE, we're here to guide you.",
      },
    ],
  },
  steps: {
    label: 'How it works',
    title: 'From your first call to your first class',
    stepWord: 'Step',
    items: [
      {
        title: "Let's talk",
        text: 'Tell us what you want to study, your budget, and what matters to you.',
      },
      {
        title: 'Find your path',
        text: "We'll help you explore programs and understand the admission requirements.",
      },
      {
        title: 'Apply with confidence',
        text: "We'll guide you through your documents, application, and next steps.",
      },
      {
        title: 'Get ready for Dubai',
        text: "From your visa to your arrival, we'll help you prepare for student life.",
      },
    ],
  },
  packages: {
    label: 'Price list',
    title: 'Pick the help you need',
    subtitle: "Every student starts with a free consultation. Upgrade only when you're ready.",
    recommended: 'Recommended',
    plans: [
      {
        name: 'Free consultation',
        price: 'Free',
        description: 'A one-on-one session to understand your options.',
        features: [
          'Personal session with an advisor',
          'Universities and programs explained',
          'Admission requirements',
          'Tuition and living cost guidance',
          'Your personal next-steps plan',
        ],
        cta: 'Book consultation',
      },
      {
        name: 'Admission',
        price: 'AED [PRICE]',
        description: 'We prepare and submit your application until you get a decision.',
        features: [
          'Everything in the free consultation',
          'Program and major selection',
          'Document checklist and review',
          'Application prepared and submitted',
          'Follow-up until your admission decision',
        ],
        cta: 'Choose Admission',
      },
      {
        name: 'Full support',
        price: 'AED [PRICE]',
        description: "Everything from your first question until you're settled in Dubai.",
        features: [
          'Everything in Admission',
          'Scholarship and discount guidance',
          'English and placement test advice',
          'Student visa support',
          'Help finding accommodation',
          'Arrival and first-semester support',
        ],
        cta: 'Choose Full support',
      },
    ],
  },
  about: {
    label: 'About us',
    title: 'We make studying in Dubai feel simple.',
    text: 'Lumos Global Education is an admissions consultancy based at Meydan in Dubai. We help students from around the world choose the right program, build a strong application and settle into life in the UAE, with a special focus on Canadian University Dubai.',
    highlights: ['One advisor, start to finish', 'Insider knowledge of CUD', 'Students from around the world'],
  },
  founder: {
    label: 'Meet the founder',
    name: 'Diana Ospanova',
    role: 'Founder and CEO · Canadian University Dubai graduate',
    bio: "Diana came to Dubai as an international student and did everything on her own: choosing a program, gathering documents, getting a visa and finding a place to live. She built Lumos to be the guide she wished she'd had.",
    quote:
      'I would have been the happiest student if a company like this had existed when I was at university. So I built it.',
  },
  application: {
    label: 'Application',
    title: 'Ready to start your journey?',
    text: 'Apply to Canadian University Dubai through the official application portal. Our team will guide you through every step.',
    cta: 'Start your application',
    note: 'Opens the application form in a new tab',
  },
  contact: {
    label: 'Contact',
    title: 'Visit us at Meydan or send a message',
    whatsappCta: 'Message on WhatsApp',
    instagramCta: 'Follow on Instagram',
    addressLine1: 'Meydan Grandstand, 6th floor',
    addressLine2: 'Meydan Road, Nad Al Sheba, Dubai, U.A.E.',
    mapTitle: 'Lumos Global Education',
    directions: 'Get directions',
  },
  footer: { rights: 'Lumos Global Education. Dubai, U.A.E.' },
  form: {
    title: 'Book a free consultation',
    subtitle: "Leave your details and we'll get back to you within one working day.",
    name: 'Full name',
    phone: 'Phone / WhatsApp',
    email: 'Email (optional)',
    interest: 'What would you like to study?',
    interestPlaceholder: 'e.g. Business, Computer Science…',
    package: 'Package',
    message: 'Anything else we should know? (optional)',
    submit: 'Send request',
    sending: 'Sending…',
    successTitle: 'Thank you!',
    successText: "We've received your request and will contact you soon.",
    whatsappInstead: 'Prefer WhatsApp? Message us directly',
    close: 'Close',
    error: 'Something went wrong. Please try again or message us on WhatsApp.',
  },
}

const ru: Copy = {
  meta: {
    title: 'Lumos Global Education — учёба в Дубае',
    description:
      'Создано студентами — от поступления до выпуска. Lumos Global Education поможет выбрать программу, поступить в университет в Дубае и освоиться в студенческой жизни.',
  },
  nav: {
    home: 'Главная',
    packages: 'Пакеты',
    about: 'О нас',
    application: 'Заявка',
    contact: 'Контакты',
    startApplication: 'Подать заявку',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    menu: 'Меню',
  },
  hero: {
    eyebrow: 'Lumos Global Education, Дубай',
    line1: 'Создано студентами',
    line2: 'От поступления до выпуска',
    description:
      'Учитесь в Дубае с поддержкой тех, кто сам прошёл этот путь. Мы поможем выбрать программу, поступить в университет и освоиться в студенческой жизни.',
    cta: 'Записаться на бесплатную консультацию',
  },
  why: {
    label: 'Почему Lumos',
    items: [
      {
        title: 'Мы были на вашем месте',
        text: 'Компанию основала выпускница CUD, которая знает, каково это — переехать в Дубай ради учёбы.',
      },
      {
        title: 'Индивидуальный подход',
        text: 'Поможем выбрать программу, которая подходит под ваши цели, бюджет и планы.',
      },
      {
        title: 'Поддержка и после поступления',
        text: 'От подачи заявки до вашего приезда в ОАЭ — мы рядом на каждом шаге.',
      },
    ],
  },
  steps: {
    label: 'Как это работает',
    title: 'От первого звонка до первой пары',
    stepWord: 'Шаг',
    items: [
      {
        title: 'Давайте поговорим',
        text: 'Расскажите, что хотите изучать, какой у вас бюджет и что для вас важно.',
      },
      {
        title: 'Найдите свой путь',
        text: 'Поможем изучить программы и разобраться в требованиях для поступления.',
      },
      {
        title: 'Поступайте уверенно',
        text: 'Проведём вас через подготовку документов, подачу заявки и следующие шаги.',
      },
      {
        title: 'Готовьтесь к Дубаю',
        text: 'От визы до приезда — поможем подготовиться к студенческой жизни.',
      },
    ],
  },
  packages: {
    label: 'Цены',
    title: 'Выберите нужную помощь',
    subtitle: 'Каждый студент начинает с бесплатной консультации. Переходите на следующий пакет, только когда будете готовы.',
    recommended: 'Рекомендуем',
    plans: [
      {
        name: 'Бесплатная консультация',
        price: 'Бесплатно',
        description: 'Личная встреча, чтобы разобраться в ваших возможностях.',
        features: [
          'Личная сессия с консультантом',
          'Обзор университетов и программ',
          'Требования для поступления',
          'Стоимость обучения и проживания',
          'Ваш персональный план действий',
        ],
        cta: 'Записаться',
      },
      {
        name: 'Поступление',
        price: 'AED [PRICE]',
        description: 'Подготовим и подадим вашу заявку и будем сопровождать до решения.',
        features: [
          'Всё из бесплатной консультации',
          'Выбор программы и специальности',
          'Список и проверка документов',
          'Подготовка и подача заявки',
          'Сопровождение до решения о зачислении',
        ],
        cta: 'Выбрать «Поступление»',
      },
      {
        name: 'Полное сопровождение',
        price: 'AED [PRICE]',
        description: 'Всё — от первого вопроса до того момента, когда вы обустроитесь в Дубае.',
        features: [
          'Всё из пакета «Поступление»',
          'Стипендии и скидки',
          'Советы по английскому и вступительным тестам',
          'Помощь со студенческой визой',
          'Помощь в поиске жилья',
          'Поддержка по приезде и в первом семестре',
        ],
        cta: 'Выбрать полное сопровождение',
      },
    ],
  },
  about: {
    label: 'О нас',
    title: 'Мы делаем учёбу в Дубае простой.',
    text: 'Lumos Global Education — консалтинговая компания по поступлению, расположенная в Meydan, Дубай. Мы помогаем студентам со всего мира выбрать подходящую программу, подготовить сильную заявку и освоиться в ОАЭ, с особым фокусом на Canadian University Dubai.',
    highlights: ['Один консультант от начала до конца', 'Знаем CUD изнутри', 'Студенты со всего мира'],
  },
  founder: {
    label: 'Основатель',
    name: 'Диана Оспанова',
    role: 'Основатель и CEO · выпускница Canadian University Dubai',
    bio: 'Диана приехала в Дубай иностранной студенткой и всё делала сама: выбирала программу, собирала документы, оформляла визу и искала жильё. Она создала Lumos, чтобы стать тем проводником, которого ей когда-то не хватало.',
    quote:
      'Я была бы самой счастливой студенткой, если бы такая компания существовала, когда я училась в университете. Поэтому я её создала.',
  },
  application: {
    label: 'Заявка',
    title: 'Готовы начать свой путь?',
    text: 'Подайте заявку в Canadian University Dubai через официальную форму. Наша команда проведёт вас через каждый шаг.',
    cta: 'Подать заявку',
    note: 'Форма заявки откроется в новой вкладке',
  },
  contact: {
    label: 'Контакты',
    title: 'Приходите к нам в Meydan или напишите',
    whatsappCta: 'Написать в WhatsApp',
    instagramCta: 'Мы в Instagram',
    addressLine1: 'Meydan Grandstand, 6-й этаж',
    addressLine2: 'Meydan Road, Nad Al Sheba, Дубай, ОАЭ',
    mapTitle: 'Lumos Global Education',
    directions: 'Построить маршрут',
  },
  footer: { rights: 'Lumos Global Education. Дубай, ОАЭ.' },
  form: {
    title: 'Бесплатная консультация',
    subtitle: 'Оставьте свои данные, и мы свяжемся с вами в течение одного рабочего дня.',
    name: 'Имя и фамилия',
    phone: 'Телефон / WhatsApp',
    email: 'Email (необязательно)',
    interest: 'Что вы хотите изучать?',
    interestPlaceholder: 'Например, бизнес, информатика…',
    package: 'Пакет',
    message: 'Что-то ещё, что нам стоит знать? (необязательно)',
    submit: 'Отправить заявку',
    sending: 'Отправляем…',
    successTitle: 'Спасибо!',
    successText: 'Мы получили вашу заявку и скоро свяжемся с вами.',
    whatsappInstead: 'Удобнее в WhatsApp? Напишите нам напрямую',
    close: 'Закрыть',
    error: 'Что-то пошло не так. Попробуйте ещё раз или напишите нам в WhatsApp.',
  },
}

export const DEFAULT_CONTENT: SiteContent = {
  settings: {
    phoneDisplay: '+971 54 410 5105',
    phoneLink: '+971544105105',
    whatsappNumber: '971544105105',
    instagramUrl: 'https://www.instagram.com/lumos.global.education/',
    applicationUrl: 'https://form.jotform.com/262631348320451',
    mapQuery: 'Meydan Grandstand, Meydan Road, Nad Al Sheba, Dubai, UAE',
    images: {
      logo: '/images/logo.jpg',
      hero: '/images/hero.jpg',
      founder: '/images/founder.jpg',
      application: '/images/application.jpg',
    },
    heroUppercase: false,
    showHeroDescription: true,
  },
  copy: { en, ru },
}
