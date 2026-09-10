"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useOrders } from "@/lib/hooks/useOrders";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function GroupAdminDashboard() {

  const { user, loadingUser } = useUser();
  const { orders, loadingOrders, error } = useOrders();

  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const doneOrdersCount = orders.filter(order => order.status === 'done').length;
  const canceledOrdersCount = orders.filter(order => order.status === 'canceled').length;

  const [changeMode, setChangeMode] = useState<'user' | 'groupAdmin'>('groupAdmin');

  return ( 
      <>
      <div className={styles.mainContainer}>
          <div className={styles.hero}>
              <label>Tableau de bord</label>
          </div>

          <div className={styles.welcome}>
              <div className={styles.welcomeAvatar}>{user?.firstName.charAt(0)} {user?.lastName.charAt(0)}</div>
              <div>
                  <p className={styles.welcomeTitle}>Bonjour, {user?.firstName} 👋 {user?.role}</p>
                  <p className={styles.welcomeSub}>
                      Bienvenue dans votre espace personnel. Gérez vos commandes, adresses et informations de compte.
                  </p>
              </div>
          </div>

          <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                  <input
                      className={styles.radioInput}
                      type="radio"
                      name="changeMode"
                      value="user"
                      checked={changeMode === 'user'}
                      onChange={(e) => setChangeMode('user' as const)}
                  />
                  <div className={styles.radioButton} style={{ borderRadius: '10px 0 0 10px' }}>Mode Administrateur de groupe</div>
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
                  <div className={styles.radioButton} style={{ borderRadius: '0 10px 10px 0' }}>Mode Utilisateur</div>
              </label>
          </div>

          {changeMode === 'groupAdmin' &&
          <div className={styles.formGroup}>
              <label htmlFor="shipping">Adresse de ramassage</label>
              Nous vous enverrons un courriel lorsque votre article sera pret a etre ramasser 
          </div>}


          {changeMode === 'user' && (<>


          <div className={styles.quickGrid}>
              <div className={styles.qcard}>
                  <div className={styles.qcardIcon}>👤</div>
                  <div>
                      <p className={styles.qcardTitle}>Mon profil</p>
                      <p className={styles.qcardValue} style={{ fontSize: '13px' }}>Cristian Fermin Lopez</p>
                      <p className={styles.qcardDesc}> {user?.email} </p>
                  </div>
                  <span className={styles.qcardLink}>Modifier mon compte →</span>
              </div>
              <div className={styles.qcard}>
                  <div className={styles.qcardIcon}>📦</div>
                  <div>
                      <p className={styles.qcardTitle}>Commandes</p>
                      <p className={styles.qcardValue}>Demandes de service</p>
                      <p className={styles.qcardDesc}>X en cours · Y terminées · Z annulées</p>
                      <p className={styles.qcardValue}>Produits de la boutique</p>
                      <p className={styles.qcardDesc}>{pendingOrdersCount} en cours · {doneOrdersCount} terminées · {canceledOrdersCount} annulées</p>
                  </div>
              </div>
          </div>  

          <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                  <h3 className={styles.sectionTitle}>Commandes récentes</h3>
              </div>

              <div className={`${styles.orderRow} ${styles.orderRowHead}`}>
                  <div className={styles.headInfos}>
                      <span>Commande</span>
                  </div>

                  <div className={styles.headDetails}>
                      <span>Détails</span>
                      <span>État</span>
                      <span>Payment</span>
                  </div>
              </div>

              <div>
              {orders.length === 0 ? (
                  <p>Aucune commande</p>
              ) : (
                  orders.map(order => (

                  <div key={order.id} className={styles.orderRow}>
                      <div className={styles.orderInfos}>
                          <span className={styles.orderNum}>#{order.orderNumber}</span>
                          <span className={styles.orderAddr}>{order.shippingAddress ? `Sera livré au ${order.shippingAddress}` : "Ramassage au 2160 rue léger"}</span>
                      </div>         

                      <div className={styles.orderDetails}>
                          <div className={styles.seeDetails}>
                              <div className={`${styles.badge} ${styles.btnDetails}`}>
                                  Voir
                                  <div className={styles.dropdownDetails}>
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
                                  <span className={`${styles.badge} ${styles.pending}`}>{order.status}</span> 
                                  <span className={styles.cancelOrder}>Click to cancel </span>
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
                  </div>
                  
                  ))
              )}
              </div>
          </div>
          </>)}
      </div>
      
      </>
  );
}