"use client";

import { useGroup } from "@/lib/hooks/useGroup";
import styles from "./groupAdmin.module.css";
import { useEffect, useState } from "react";

export default function ModeGroupAdmin() {

    const { group, loadingGroup, errorGroup } = useGroup();

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    
    
    useEffect(() => {
        const users = group?.users.filter(user => user.role === 'user') || [];
        if (users.length > 0) {
            setSelectedUserId(users[0].id);
        }
    }, [group?.users]);

    
    if (!group) return null;
    const selectedUser = group.users.find(user => user.id === selectedUserId);
    if (loadingGroup) return <div>Chargement groupe...</div>;
    if (errorGroup) return <div>Erreur: {errorGroup}</div>;

    

    return ( 
        <div className={styles.mainContainer}>
            <div className={styles.label}>
                Mode administrateur de groupe
            </div>

            <div className={styles.membersData}>
                <div className={styles.members}>
                    {group.users.filter(user => user.role === 'user').map(user => 
                    <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        
                    >
                        {user.firstName} {user.lastName}
                    </button>
                    )}
                </div>

                {selectedUser && <div className={styles.userDetails}>
                    <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p><strong>Email :</strong> {selectedUser.email}</p>
                    <p><strong>Téléphone :</strong> {selectedUser.phone}</p>
                    {selectedUser.companyName && <p><strong>Entreprise :</strong> {selectedUser.companyName}</p>}
                    {selectedUser.shippingAddress && <p><strong>Adresse :</strong> {selectedUser.shippingAddress}</p>}
                </div>}
            </div>
        </div>
    );
}