import * as securedLocalStorage from "./SecureLocalaStorage";
import jwt_decode from "jwt-decode";
import moment from "moment";

export const checkAccess = (screen, type) => {
    const userdata = jwt_decode(securedLocalStorage.get("token"));
    const roles = userdata?.userRoles;
    const currentRole = userdata?.userRoleName;
    let value = false;
    roles?.forEach(e => {
        if (e.page.toLowerCase() === screen.toLowerCase()) {
            e?.roles?.forEach(ele => {
                if (ele.role === currentRole) {
                    value = ele[type];
                }
            })
        }
    });

    return value;
}

export const getRole = () => {
    return (jwt_decode(securedLocalStorage.get("token"))).userRoleName;
}

export const getUserId = () => {
    return (jwt_decode(securedLocalStorage.get("token"))).userId;

}

export const getDateInFormat = (date) => {
    return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
}