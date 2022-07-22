
;; protocol-contract
;; Sample protocol contract for using DLC.Link.
;; This contract is a sample representing a protocol that would call into the DLC.Link management contract
;; It borrows from the Clarity trait to
;; - Open the dlc
;; - Accept the callback and store the returned UUID
;; - Close the DLC

;; constants
(define-constant err-cant-unwrap (err u1000))
(define-constant err-unknown-user-contract (err u2003))
;;

;; data maps and vars
;;
(define-map usercontracts
	uint
	{
    dlc_uuid: (optional (buff 8)),
    nonce: uint
    ;; Other data about the user and their specific contract
	}
)

(define-read-only (get-usercontract (nonce uint)) 
  (map-get? usercontracts nonce))

;; private functions
;;

(use-trait cb-trait .dlc-create-callback-trait.dlc-create-callback-trait)
(impl-trait .dlc-create-callback-trait.dlc-create-callback-trait)

;; implemented from the trait, this is what is used to pass back the uuid created by the DLC system
(define-public (post-create-handler (nonce uint) (uuid (buff 8)))
    (begin
        (print {uuid: uuid, nonce: nonce})
        (map-set usercontracts nonce (
            merge (unwrap! (map-get? usercontracts nonce) err-unknown-user-contract ) {
            dlc_uuid: (some uuid),
            nonce: nonce
        }))
        (ok true)
    )
)

;; public functions
;;

(define-public (setup-user-contract (target <cb-trait>))
    ;; as one of the steps in the setup-user-contract function, it calls the dlc contract to create a dlc
    (let ((nonce u12345))
    (begin
        (map-set usercontracts nonce {
                dlc_uuid: none,
                nonce: nonce
            })
        (as-contract (contract-call? .dlc-manager-pricefeed-v1-01 create-dlc 0x425443 u22000 u1658339403 u1658339403 target u12345))
    ))
)
;; Calling setup-user-contract should return 3, as the initial value of 1 gets incremented twice
;; Once in create-dlc, and once in post-create-handler
;; Call with (contract-call? .protocol-contract setup-user-contract .protocol-contract)

