"use client";

import styles from "./page.module.css";
import { useMemo, useState } from "react";
import UpdateProfile from "./components/updateProfile/updateProfile";
import { useUser } from "@/lib/hooks/useUser";
import { useOrders } from "@/lib/hooks/useOrders";
import ModeGroupAdmin from "./components/groupAdmin/groupAdmin";
import { cancelOrder } from "@/lib/actions/order";

export default function UserDashboard() {

    const [updateProfile, setUpdateProfile] = useState<boolean>(false);

    const { user, loadingUser, errorUser } = useUser();
    const { orders, loadingOrders, error, refetch } = useOrders();

    const [changeMode, setChangeMode] = useState<'user' | 'groupAdmin'>('user');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

    const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);

    // ✅ Memoize les calculs
    const orderStats = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending').length,
        done: orders.filter(o => o.status === 'done').length,
        canceled: orders.filter(o => o.status === 'canceled').length,
    }), [orders]);

    const handleCancelOrder = async (orderId: string) => {
        const result = await cancelOrder(orderId);
        if (result.success) {
            setCancelOrderId(null);
            await refetch(); // ✅ Refresh les commandes
        } else {
            console.error(result.error);
        }
    };

    // ✅ États de chargement granulaires
    if (loadingUser) return <div>Chargement profil...</div>;
    if (errorUser) return <div>Erreur: {errorUser}</div>;
    
    return ( 
        <>
        <div className={styles.mainContainer}>

            <div className={styles.welcome}>
                <div className={styles.welcomeAvatar}>{user?.firstName.charAt(0)}{user?.lastName.charAt(0)}</div>
                <div>
                    <p className={styles.welcomeTitle}>Bonjour, {user?.firstName} 👋</p>
                    <p className={styles.welcomeSub}>
                        Bienvenue dans votre espace personnel. Gérez vos commandes, adresses et informations de compte.
                    </p>
                </div>
            </div>

            {user?.role === "groupAdmin" && <>
            <div className={styles.changeMode}>
                <h1>En tant que gestionnaire d'equipe, vous pouvez voir les informations de votre groupe en cliquant sur Administrateur</h1>
                <div className={styles.mode}>
                    <label className={styles.radioLabel}>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="changeMode"
                            value="user"
                            checked={changeMode === 'user'}
                            onChange={(e) => setChangeMode('user' as const)}
                        />
                        <div className={styles.radioButton} style={{ borderRadius: '10px 0 0 10px' }}>Utilisateur</div>
                    </label>

                    <label className={styles.radioLabel}>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="changeMode"
                            value="groupAdmin"
                            checked={changeMode === 'groupAdmin'}
                            onChange={(e) => setChangeMode('groupAdmin' as const)}
                        />
                        <div className={styles.radioButton} style={{ borderRadius: '0 10px 10px 0' }}>Administrateur</div>
                    </label>
                </div>
            </div>
            </>}

            {changeMode === 'groupAdmin' &&
            <div className={styles.modeAdmin}>
                <ModeGroupAdmin />
            </div>}
            
            {changeMode === 'user' &&<>
            <div className={styles.userData}>
                <div className={styles.personalData} onClick={() => setUpdateProfile(true)}>
                    <div className={styles.qcardIcon}>👤</div>
                    <div>
                        <p className={styles.qcardTitle}>Mon profil</p>
                        <p className={styles.qcardValue} style={{ fontSize: '13px' }}>Cristian Fermin Lopez</p>
                        <p className={styles.qcardDesc}> {user?.email} </p>
                    </div>
                    <span className={styles.qcardLink}>Modifier mon compte →</span>
                </div>

                <div className={styles.ordersData}>
                    <div className={styles.qcardIcon}>📦</div>
                    <div>
                        <p className={styles.qcardTitle}>Commandes</p>
                        <p className={styles.qcardValue}>Demandes de service</p>
                        <p className={styles.qcardDesc}>X en cours · Y terminées · Z annulées</p>
                        <p className={styles.qcardValue}>Produits de la boutique</p>
                        <p className={styles.qcardDesc}>{orderStats.pending} en cours · {orderStats.done} terminées · {orderStats.canceled} annulées</p>
                    </div>
                </div>
            </div>  

            <div className={styles.shopOrders}>
                <h3 className={styles.title}>Commandes de produits de la boutique</h3>

                <div className={styles.header}>
                    <div>
                        <span>Commande</span>
                    </div>

                    <div>
                        <span>Détails</span>
                        <span>État</span>
                        <span>Payment</span>
                    </div>
                </div>


                {loadingOrders && <p>Chargement commandes...</p>}

                {orders.length === 0 ? (
                <p>Aucune commande</p>
                ) : (
                orders.map(order => (

                <div key={order.id} className={styles.order}>
                    <div>
                        <span className={styles.orderNum}>#{order.orderNumber}</span>
                        <span className={styles.orderAddr}>{order.shippingAddress ? `Sera livré au ${order.shippingAddress}` : "Ramassage au 2160 rue léger"}</span>
                    </div>         

                    <div>
                        <h1>
                            <span className={styles.seeDetails} onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}>
                                {selectedOrderId === order.id ? "Fermer" : "Voir"}
                            </span>
                            {selectedOrderId === order.id && (
                            <div className={styles.details}>
                                <h3>Voici la liste de produit de cette commande</h3>
                                {order.items.map((item) => (
                                <div key={item.id} className={styles.productList}>
                                    <p>
                                        <strong>{item.product.name_fr}</strong> x{item.quantity}
                                    </p>
                                </div>
                                ))}
                            </div>
                            )}
                        </h1>

                        <h1>
                            {order.status === "pending" &&
                            <span className={`${styles.pending} ${cancelOrderId === order.id ? styles.pendingActive : ''}`} onClick={() => setCancelOrderId(cancelOrderId === order.id ? null : order.id)}>
                                {cancelOrderId === order.id ? "Non" : "En traitement"}
                            </span>}

                            {cancelOrderId === order.id && (
                            <div className={styles.cancel}>
                                Voulez-vous vraiment annuler ?
                                <button onClick={() => handleCancelOrder(order.id)}>Oui, je veux annuler cette commande</button>
                            </div>
                            )}

                            {order.status === "canceled" &&
                            <span className={`${styles.canceled} ${cancelOrderId === order.id ? styles.pendingActive : ''}`} onClick={() => setCancelOrderId(cancelOrderId === order.id ? null : order.id)}>
                                canceled
                            </span>}

                            {order.status === "done" &&
                            <span className={`${styles.done} ${cancelOrderId === order.id ? styles.pendingActive : ''}`} onClick={() => setCancelOrderId(cancelOrderId === order.id ? null : order.id)}>
                                done
                            </span>}
                        </h1>

                        <h1>
                            {order.status !== "canceled" && (!order.isPaid ?
                            <span className={styles.isNotPayed}>Faire un paiement</span>
                            :
                            <span className={styles.isPayed}>Paiement fait</span>
                            )}
                        </h1>
                    </div>

                    <div>
                        <h1>
                            {order.isPaid ?
                            <span className={styles.isNotPayed}>Faire un paiement</span>
                            :
                            <span className={styles.isPayed}>Paiement fait</span>
                            }
                        </h1>
                    </div>
                </div>
                
                ))
                )}
            </div>
            </>}
        </div>
        
        {updateProfile && <UpdateProfile onClose={() => setUpdateProfile(false)} />}
        </>
    );
}

{/*
    
<div className={styles.orderInfos}>
    <span className={styles.orderNum}>#{order.orderNumber}</span>
    <span className={styles.orderAddr}>{order.shippingAddress ? `Sera livré au ${order.shippingAddress}` : "Ramassage au 2160 rue léger"}</span>
</div>         

<div className={styles.orderDetails}>
    <div className={styles.seeDetails}>
        <div className={`${styles.badge} ${styles.btnDetails}`}>
            Voir
            {/*<div className={styles.dropdownDetails}>
                {order.items.map((item) => (
                    <div key={item.id} className={styles.item}>
                        <h1>{item.product.name_fr}</h1>
                        <p>Quantité: {item.quantity}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>

    <div className={styles.orderStatus}>
        <div className={styles.status}>
            {order.status === "pending" && (<>
            <div className={`${styles.badge} ${styles.pending}`}
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                style={{ cursor: 'pointer' }}>
                {order.status}
            </div> 
            <div className={styles.cancelOrder}>Click to cancel </div>
            {expandedOrderId === order.id && (
            <div className={styles.confirmCancel} onClick={() => handleCancelOrder(order.id)}>
                <button>confirmer l'annulation de cette commande</button>
            </div>)}
            </>)}
        </div>
        {order.status === "done" && <span className={`${styles.badge} ${styles.done}`}>{order.status}</span>}
        {order.status === "canceled" && <span className={`${styles.badge} ${styles.canceled}`}>{order.status}</span>}
    </div>

    <div className={styles.paymentStatus}>
        {order.isPaid && <span className={`${styles.badge} ${styles.isPaid}`}>Payed</span>}
        {!order.isPaid && order.status !== "canceled" && <span className={`${styles.badge} ${styles.isNotPaid}`}>Effectuer un paiement</span>}
    </div>
</div>
    
    
    */}