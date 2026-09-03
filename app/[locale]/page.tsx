"use client";

// Utils
import Link from "next/link";
import styles from "./page.module.css";
import Image from "next/image";
import { useState } from "react";

// React icons
import { FaPaperPlane } from "react-icons/fa";
import { IoIosCheckmark } from "react-icons/io";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";

// Framer motion
import { motion } from "framer-motion";

// Translater
import { useTranslations } from 'next-intl';

export default function Home() {

  const t = useTranslations('home');
  const testimonials = t.raw('testimonials');

  const [leftTestimonial, setLeftTestimonial] = useState(0);
  const [rightTestimonial, setRightTestimonial] = useState(1);
  
  const changeRight = () => {
    if (rightTestimonial == testimonials.length-1) {
      setLeftTestimonial(rightTestimonial);
      setRightTestimonial(0);
    } else {
      setLeftTestimonial(rightTestimonial);
      setRightTestimonial(rightTestimonial+1);
    }
  }
  
  const changeLeft = () => {
      if (leftTestimonial == 0) {
          setRightTestimonial(leftTestimonial);
          setLeftTestimonial(testimonials.length - 1);
      } else {
          setRightTestimonial(leftTestimonial);
          setLeftTestimonial(leftTestimonial - 1);
      }
  }

  return ( 
    <div className={styles.mainContainer}>
      <div className={styles.homeHero}>
        <div className={styles.leftContent}>
          <div className={styles.heroText}>
            <motion.h3 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>{t('title_quote_1')}</motion.h3>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>{t('title_quote_2')}</motion.h1>
            <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>{t('title_quote_3')}</motion.h2>
            <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>{t('title_quote_4')}</motion.h2>
            
            <br />
            <br />
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}>
              <Link href="/demande-service" className={styles.demandeButton}>
                <FaPaperPlane className={styles.demandeButtonLogo}/> {t('onlineApplication')}
              </Link>
            </motion.div>
          </div>
        </div>

        <div className={styles.rightContent}>
          <Image src="/home/pancarte-slider-v2.png" alt="Hero Pancarte" className={styles.logoPancarte} width={800} height={800} priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
        </div>
      </div>

      <div className={styles.membershipContainer}>
        <div className={styles.advantages}>
          <div className={styles.logoContainer}>
            <Image src="/home/membership.jpg" alt="Hero Pancarte" className={styles.memberLogo} width={287} height={197} priority/>
          </div>

          <div className={styles.advantagesList}>
            <h1>{t('advantages.title')}</h1>
            
            <div className={styles.listItem}>
              <ul>
                <li><IoIosCheckmark className={styles.checkIcon} />{t('advantages.adv1')}</li>
                <li><IoIosCheckmark className={styles.checkIcon} />{t('advantages.adv2')}</li>
              </ul>
              <ul>
                <li><IoIosCheckmark className={styles.checkIcon} />{t('advantages.adv3')}</li>
                <li><IoIosCheckmark className={styles.checkIcon} />{t('advantages.adv4')}</li>
                <li><IoIosCheckmark className={styles.checkIcon} />{t('advantages.adv5')}</li>
              </ul>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <Link href="/becomeMember" className={styles.becomeMemberButton}>
              {t('becomeMember')}
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.aboutcontainer}>
        
        <div className={styles.about}>
          <h1><span>Pancarte Express</span> {t('aboutTitle')}</h1>
          <p>
            {t('aboutP1')}
            <br/>
            <br/>
            {t('aboutP2')}
          </p>
          <div className={styles.contactContainer}>
            <Link href="/contact" className={styles.contactButton}>
              <FaPaperPlane className={styles.contactButtonLogo}/> {t('contactUs')}
            </Link>
          </div>
        </div>

        <div className={styles.examples}>
          <div className={styles.exampleItem}>
            <div className={styles.logo}>
              <Image src="/home/pancarte-rampe.png" alt="Hero Pancarte" className={styles.logoPancarte} width={94} height={94} priority/>
            </div>
            <div className={styles.texte}>{t('serviceCard1')}<br /><span className={styles.bold}>{t('serviceCardSub1')}</span></div>
          </div>
           <div className={styles.exampleItem}>
            <div className={styles.logo}>
              <Image src="/home/pancarte-structure.png" alt="Hero Pancarte" className={styles.logoPancarte} width={94} height={94} priority/>
            </div>
            <div className={styles.texte}>{t('serviceCard2')} <br /><span className={styles.bold}>{t('serviceCardSub2')}</span></div>
          </div>
           <div className={styles.exampleItem}>
            <div className={styles.logo}>
              <Image src="/home/pancarte-mur.png" alt="Hero Pancarte" className={styles.logoPancarte} width={94} height={94} priority/>
            </div>
            <div className={styles.texte}>{t('serviceCard3')} <br /><span className={styles.bold}>{t('serviceCardSub3')}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.testimonialsContainer}>
        <div className={styles.testimonialsTitle}>
          <div className={styles.whiteSpace}></div>
          <h1 className={styles.title}>{t('testimonialsTitle')}</h1>
          <div className={styles.arrows}>
            <button type="button" onClick={changeLeft}>
              <IoIosArrowDropleft className={styles.left}/>
            </button>

            <button type="button" onClick={changeRight}>
              <IoIosArrowDropright  className={styles.right}/>
            </button>
          </div>
        </div>
        
        <div className={styles.cardsContainer}>
          <div className={styles.cardLeft}>
            <div className={styles.logo}>
              <Image src="/home/logo_commentaires.png" alt="Hero Pancarte" className={styles.logoPancarte} width={69} height={71} priority/>
            </div>
            <p className={styles.texte}>
              {testimonials[leftTestimonial].texte}
            </p>
            <h3 className={styles.name}>{testimonials[leftTestimonial].name}</h3>
            <div className={styles.rate}>
              <Image src="/home/ratings.png" alt="Logo Ratings" className={styles.logoPancarte} width={98} height={18} priority/>
            </div>
          </div>

          <div className={styles.cardRight}>
            <div className={styles.logo}>
              <Image src="/home/logo_commentaires.png" alt="Logo Commentaire" className={styles.logoPancarte} width={69} height={71} priority/>
            </div>
            <p className={styles.texte}>
              {testimonials[rightTestimonial].texte}
            </p>
            <h3 className={styles.name}>{testimonials[rightTestimonial].name}</h3>
            <div className={styles.rate}>
              <Image src="/home/ratings.png" alt="Logo Ratings" className={styles.logoPancarte} width={98} height={18} priority/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}