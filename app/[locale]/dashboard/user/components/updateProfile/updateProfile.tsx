"use client";

import styles from "./updateProfile.module.css";
import { useEffect } from "react";

interface UpdateProfileProps {
    onClose: () => void;
}

export default function UpdateProfile({ onClose }: UpdateProfileProps) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);
  
    return ( 
        <div className={styles.mainContainer}>
            <button onClick={onClose}>Fermer</button>
        </div>
    );
}