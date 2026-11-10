/**
 * The seven services offered on the original website, in the original order.
 * `cover` is the photo used on the card / service page (a path inside
 * src/assets/photos/work/, without extension). Every photo in the service's
 * folder (work/<slug>/) also appears in the gallery under this category.
 */
import type { Localized } from './site';
import type { IconName } from '../components/icons';

export interface Service {
  slug: string;
  icon: IconName;
  cover: string;
  title: Localized;
  short: Localized;
  long: Localized;
  includes: { ka: string[]; en: string[] };
}

export const services: Service[] = [
  {
    slug: 'tire-repair',
    icon: 'tire',
    cover: 'tire-repair/mechanic-inspecting-tire',
    title: { ka: 'საბურავის შეკეთება', en: 'Tire repair' },
    short: {
      ka: 'საბურავის დაზიანების შემოწმება და შეკეთება ადგილზე.',
      en: 'Inspecting and repairing tire damage on the spot.',
    },
    long: {
      ka: 'გაგეხვრიტათ საბურავი ან ჰაერს უშვებს? მოვალთ თქვენთან, შევამოწმებთ დაზიანებას და, თუ საბურავი შეკეთებადია, შევაკეთებთ იქვე — სერვისამდე მისვლა არ დაგჭირდებათ.',
      en: 'Got a puncture or a tire that keeps losing air? We come to you, inspect the damage and, if the tire can be repaired, fix it right there — no need to get to a workshop.',
    },
    includes: {
      ka: ['დაზიანების შემოწმება ადგილზე', 'გახვრეტილი საბურავის შეკეთება', 'ჰაერის გადინების აღმოფხვრა'],
      en: ['On-the-spot damage inspection', 'Puncture repair', 'Fixing air leaks'],
    },
  },
  {
    slug: 'tire-change',
    icon: 'wrench',
    cover: 'tire-change/impact-wrench-wheel-change',
    title: { ka: 'საბურავის შეცვლა', en: 'Tire change' },
    short: {
      ka: 'დაზიანებული საბურავის მოხსნა და სათადარიგო საბურავის დაყენება.',
      en: 'Removing the damaged tire and fitting your spare.',
    },
    long: {
      ka: 'თუ საბურავი შეკეთებას აღარ ექვემდებარება, მოვხსნით დაზიანებულ ბორბალს და დაგიყენებთ სათადარიგოს, რომ გზა უსაფრთხოდ გააგრძელოთ.',
      en: 'If the tire can no longer be repaired, we take off the damaged wheel and fit your spare so you can continue your journey safely.',
    },
    includes: {
      ka: ['დაზიანებული ბორბლის მოხსნა', 'სათადარიგო საბურავის დაყენება', 'ჭანჭიკების სწორად მოჭერა'],
      en: ['Removing the damaged wheel', 'Fitting the spare tire', 'Tightening the wheel nuts correctly'],
    },
  },
  {
    slug: 'wheel-service',
    icon: 'gauge',
    cover: 'wheel-service/tire-pressure-check',
    title: { ka: 'დისკისა და საბურავის მომსახურება', en: 'Rim & tire service' },
    short: {
      ka: 'საბურავისა და დისკის პრობლემების შემოწმება.',
      en: 'Diagnosing tire and rim problems.',
    },
    long: {
      ka: 'ვიბრაცია, ჰაერის დაკარგვა ან უცნაური ხმა სვლისას? შევამოწმებთ საბურავსა და დისკს, დავადგენთ პრობლემის მიზეზს და გეტყვით, როგორ მოგვარდება.',
      en: 'Vibration, losing air or a strange noise while driving? We check the tire and the rim, find the cause of the problem and tell you how it can be fixed.',
    },
    includes: {
      ka: ['საბურავის მდგომარეობის შემოწმება', 'დისკის დაზიანების დიაგნოსტიკა', 'რჩევა, როგორ მოგვარდეს პრობლემა'],
      en: ['Tire condition check', 'Rim damage diagnostics', 'Advice on the right fix'],
    },
  },
  {
    slug: 'rim-straightening',
    icon: 'rim',
    cover: 'rim-straightening/alloy-rim-close-up',
    title: { ka: 'დისკის გასწორება', en: 'Rim straightening' },
    short: {
      ka: 'გამრუდებული დისკის გასწორება სპეციალურ დანადგარზე — ვიბრაციისა და ჰაერის გადინების აღმოსაფხვრელად.',
      en: 'Straightening bent rims on a dedicated machine to stop vibration and air leaks.',
    },
    long: {
      ka: 'ორმოსა ან ბორდიურზე დარტყმის შემდეგ დისკი შეიძლება გამრუდდეს, რასაც მოსდევს ვიბრაცია და ჰაერის გადინება. გამრუდებულ დისკს ვასწორებთ სპეციალურ დანადგარზე.',
      en: 'Hitting a pothole or a kerb can bend a rim, which leads to vibration and air leaks. We straighten bent rims on a dedicated machine.',
    },
    includes: {
      ka: ['დისკის გამრუდების შემოწმება', 'გასწორება სპეციალურ დანადგარზე', 'ვიბრაციისა და ჰაერის გადინების აღმოფხვრა'],
      en: ['Checking where the rim is bent', 'Straightening on a dedicated machine', 'Eliminating vibration and air leaks'],
    },
  },
  {
    slug: 'wheel-balancing',
    icon: 'balance',
    cover: 'wheel-balancing/mounting-balanced-wheel',
    title: { ka: 'საბურავის ბალანსირება', en: 'Wheel balancing' },
    short: {
      ka: 'ბორბლის ბალანსირება ვიბრაციისა და არათანაბარი ცვეთვის აღმოსაფხვრელად.',
      en: 'Wheel balancing to eliminate vibration and uneven tire wear.',
    },
    long: {
      ka: 'დაუბალანსებელი ბორბალი საჭეზე ვიბრაციას იწვევს და საბურავს არათანაბრად ცვეთს. ბალანსირების შემდეგ სვლა მშვიდი ხდება, საბურავი კი უფრო დიდხანს გაძლებს.',
      en: 'An unbalanced wheel makes the steering wheel vibrate and wears the tire unevenly. After balancing the ride is smoother and the tire lasts longer.',
    },
    includes: {
      ka: ['ბორბლის დისბალანსის გაზომვა', 'საბალანსო ტვირთების დამაგრება', 'ვიბრაციის აღმოფხვრა'],
      en: ['Measuring wheel imbalance', 'Fitting balance weights', 'Eliminating vibration'],
    },
  },
  {
    slug: 'mobile-welding',
    icon: 'flame',
    cover: 'mobile-welding/welding-sparks',
    title: { ka: 'შედუღება ადგილზე', en: 'On-site welding' },
    short: {
      ka: 'მეტალის ნაწილების შედუღება გამოძახებით — თქვენს მისამართზე.',
      en: 'Welding metal parts on call — at your address.',
    },
    long: {
      ka: 'მეტალის ნაწილის შედუღება გჭირდებათ? გამოგვიძახეთ და შედუღებას შევასრულებთ ადგილზე, თქვენს მისამართზე.',
      en: 'Need a metal part welded? Call us out and we will do the welding on site, at your address.',
    },
    includes: {
      ka: ['მეტალის ნაწილების შედუღება', 'მისვლა თქვენს მისამართზე', 'მომსახურება გამოძახებით'],
      en: ['Welding of metal parts', 'We come to your address', 'Service on call'],
    },
  },
  {
    slug: 'roadside-assistance',
    icon: 'siren',
    cover: 'roadside-assistance/service-van-technician',
    title: { ka: 'გზაზე გადაუდებელი დახმარება', en: 'Roadside emergency help' },
    short: {
      ka: 'მოძრავი ვულკანიზაციის გამოძახება ავტომობილის ადგილზე მომსახურებისთვის.',
      en: 'Call out our mobile tire service to fix your car where it stands.',
    },
    long: {
      ka: 'გზაზე საბურავი დაგიზიანდათ? დაგვირეკეთ, გვითხარით სად ხართ და მოძრავი ვულკანიზაცია მოვა თქვენთან — დღისა და ღამის ნებისმიერ დროს.',
      en: 'Tire trouble on the road? Call us, tell us where you are and our mobile tire service will come to you — any time of day or night.',
    },
    includes: {
      ka: ['მისვლა თქვენს ადგილმდებარეობაზე', 'მომსახურება 24/7', 'საბურავის პრობლემის მოგვარება ადგილზე'],
      en: ['We come to your location', 'Available 24/7', 'Tire problems solved on the spot'],
    },
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
