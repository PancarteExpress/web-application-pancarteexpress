"use client";

import { useGroup } from "@/lib/hooks/useGroup";
import styles from "./groupAdmin.module.css";

export default function ModeGroupAdmin() {

    const { group, loadingGroup, errorGroup } = useGroup();

    if (!group) return null; // Pas de groupe
    if (loadingGroup) return <div>Chargement groupe...</div>;
    if (errorGroup) return <div>Erreur: {errorGroup}</div>;

    return ( 
        <div className={styles.mainContainer}>
            <div className={styles.test}>
                Mode administrateur de groupe
            </div>

            {group.users
            .filter(user => user.role === 'user')
            .map(user => <div key={user.id}>{user.firstName}</div>)}
        </div>
    );
}