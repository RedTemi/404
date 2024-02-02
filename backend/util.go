package the404

type Role string

const (
	ADMIN   Role = "ADMIN"
	FOUNDER Role = "FOUNDER"
	DEALER  Role = "DEALER"
	CASHIER Role = "CASHIER"
	VIP     Role = "VIP"
	MEMBER  Role = "MEMBER"
	PENDING Role = "PENDING"
	BANNED  Role = "BANNED"
)

const (
	JwtKey  = "auth-token"
	RoleKey = "role"
)

func (r *Role) Scan(src any) error {
	*r = Role(src.([]byte))
	return nil
}

func ContainsAny[A comparable](arr []A, val ...A) bool {
	for _, v := range arr {
		for _, val := range val {
			if v == val {
				return true
			}
		}
	}
	return false
}
