'use client';

import styles from './page.module.css';
import { useDashboard } from '@/lib/hooks/useDashboard';
import UpdateProfile from './components/updateProfile/updateProfile';
import ModeGroupAdmin from './components/groupAdmin/groupAdmin';
import Payment from './components/payment/payment';

export default function UserDashboard() {
  const [state, actions] = useDashboard();

  if (state.loadingUser) {
    return <div>Chargement profil...</div>;
  }

  if (state.errorUser) {
    return <div>Erreur: {state.errorUser}</div>;
  }

  if (!state.user) {
    return <div>Utilisateur non trouvé</div>;
  }

  return (
    <>
      <div className={styles.mainContainer}>
        {/* Welcome Section */}
        <div className={styles.welcome}>
          <div className={styles.welcomeAvatar}>
            {state.user.firstName.charAt(0)}
            {state.user.lastName.charAt(0)}
          </div>
          <div>
            <p className={styles.welcomeTitle}>Bonjour, {state.user.firstName} 👋</p>
            <p className={styles.welcomeSub}>
              Bienvenue dans votre espace personnel. Gérez vos commandes, adresses et
              informations de compte.
            </p>
          </div>
        </div>

        {/* Mode Selector (Group Admin only) */}
        {state.isGroupAdmin && (
          <div className={styles.changeMode}>
            <h1>
              En tant que gestionnaire d'equipe, vous pouvez voir les informations de
              votre groupe en cliquant sur Administrateur
            </h1>
            <div className={styles.mode}>
              <label className={styles.radioLabel}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="changeMode"
                  value="user"
                  checked={state.changeMode === 'user'}
                  onChange={() => actions.setChangeMode('user')}
                />
                <div
                  className={styles.radioButton}
                  style={{ borderRadius: '10px 0 0 10px' }}
                >
                  Utilisateur
                </div>
              </label>

              <label className={styles.radioLabel}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="changeMode"
                  value="groupAdmin"
                  checked={state.changeMode === 'groupAdmin'}
                  onChange={() => actions.setChangeMode('groupAdmin')}
                />
                <div
                  className={styles.radioButton}
                  style={{ borderRadius: '0 10px 10px 0' }}
                >
                  Administrateur
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Admin Mode Panel */}
        {state.changeMode === 'groupAdmin' && (
          <div className={styles.modeAdmin}>
            <ModeGroupAdmin />
          </div>
        )}

        {/* User Mode Panel */}
        {state.changeMode === 'user' && (
          <>
            <div className={styles.userData}>
              <div
                className={styles.personalData}
                onClick={() => actions.setUpdateProfileOpen(true)}
              >
                <div className={styles.qcardIcon}>👤</div>
                <div>
                  <p className={styles.qcardTitle}>Mon profil</p>
                  <p className={styles.qcardValue} style={{ fontSize: '13px' }}>
                    {state.user.firstName} {state.user.lastName}
                  </p>
                  <p className={styles.qcardDesc}>{state.user.email}</p>
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
                  <p className={styles.qcardDesc}>
                    {state.orderStats.pending} en cours · {state.orderStats.done}{' '}
                    terminées · {state.orderStats.canceled} annulées
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
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

              {state.loadingOrders && <p>Chargement commandes...</p>}

              {state.orders.length === 0 ? (
                <p>Aucune commande</p>
              ) : (
                state.orders.map(order => (
                  <div key={order.id} className={styles.order}>
                    <div>
                      <span className={styles.orderNum}>#{order.orderNumber}</span>
                      <span className={styles.orderAddr}>
                        {order.shippingAddress
                          ? `Sera livré au ${order.shippingAddress}`
                          : 'Ramassage au 2160 rue léger'}
                      </span>
                    </div>

                    <div>
                      <h1>
                        <span
                          className={styles.seeDetails}
                          onClick={() =>
                            actions.setSelectedOrderId(
                              state.selectedOrderId === order.id ? null : order.id
                            )
                          }
                        >
                          {state.selectedOrderId === order.id ? 'Fermer' : 'Voir'}
                        </span>
                        {state.selectedOrderId === order.id && (
                          <div className={styles.details}>
                            <h3>Voici la liste de produit de cette commande</h3>
                            {order.items.map(item => (
                              <div key={item.id} className={styles.productList}>
                                <p>
                                  <strong>{item.product.name_fr}</strong> x
                                  {item.quantity}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </h1>

                      <h1>
                        {order.status === 'pending' && (
                          <span
                            className={`${styles.pending} ${
                              state.cancelOrderId === order.id ? styles.pendingActive : ''
                            }`}
                            onClick={() =>
                              actions.setCancelOrderId(
                                state.cancelOrderId === order.id ? null : order.id
                              )
                            }
                          >
                            {state.cancelOrderId === order.id ? 'Non' : 'En traitement'}
                          </span>
                        )}

                        {state.cancelOrderId === order.id && (
                          <div className={styles.cancel}>
                            Voulez-vous vraiment annuler ?
                            <button onClick={() => actions.handleCancelOrder(order.id)}>
                              Oui, je veux annuler cette commande
                            </button>
                          </div>
                        )}

                        {order.status === 'canceled' && (
                          <span
                            className={`${styles.canceled} ${
                              state.cancelOrderId === order.id ? styles.pendingActive : ''
                            }`}
                            onClick={() =>
                              actions.setCancelOrderId(
                                state.cancelOrderId === order.id ? null : order.id
                              )
                            }
                          >
                            canceled
                          </span>
                        )}

                        {order.status === 'done' && (
                          <span
                            className={`${styles.done} ${
                              state.cancelOrderId === order.id ? styles.pendingActive : ''
                            }`}
                            onClick={() =>
                              actions.setCancelOrderId(
                                state.cancelOrderId === order.id ? null : order.id
                              )
                            }
                          >
                            done
                          </span>
                        )}
                      </h1>

                      <h1>
                        {order.status !== 'canceled' &&
                          (order.isPaid ? (
                            <span className={styles.isPayed}>Paiement fait</span>
                          ) : (
                            <span
                              className={styles.isNotPayed}
                              onClick={() => actions.setMakePaymentOpen(true)}
                            >
                              Faire un paiement
                            </span>
                          ))}
                      </h1>
                    </div>

                    <div>
                      <h1>
                        {order.status !== 'canceled' &&
                          (order.isPaid ? (
                            <span className={styles.isPayed}>Paiement fait</span>
                          ) : (
                            <button
                              className={styles.isNotPayed}
                              onClick={() => actions.handleMakePayment(order.id)}
                            >
                              Faire un paiement
                            </button>
                          ))}
                      </h1>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {state.updateProfileOpen && (
        <UpdateProfile onClose={() => actions.setUpdateProfileOpen(false)} />
      )}
      {state.makePaymentOpen && (
        <Payment onClose={() => actions.setMakePaymentOpen(false)} />
      )}
    </>
  );
}