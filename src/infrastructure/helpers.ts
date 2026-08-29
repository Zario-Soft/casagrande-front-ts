import moment from "moment";

export const formatDate = (value: any): string => {
    const dt = moment(value, "yyyy-MM-DD");
    return dt.isValid()
        ? dt.format("DD/MM/yyyy")
        : "--"
}

export const formatDateUnknown = (date: Date) => moment(date).format("yyyy-MM-DD") as unknown as Date;

const moneyFormater = Intl.NumberFormat("pt-br", { style: 'currency', currency: 'BRL' })
export const formatMoney = (params: any) => moneyFormater.format(params);

export interface UserInfo {
    login: string,
    fullname: string,
    is_admin: boolean,
    allowed_routes: string,
}

export const GetLoggerUser = () => {
    const userInfo = GetUserInfo();
    if (!userInfo) return false;

    return userInfo.login;
}

export const IsAuthorized = (route: string) => {
    const userInfo = GetUserInfo();
    if (!userInfo) return false;

    if (!!userInfo.is_admin) return true;

    const allowedRoutes = [...(userInfo.allowed_routes || '').split(','), '/'];

    return allowedRoutes.find(r => r === route) !== undefined;
}

export const IsAdmin = () => {
    const userInfo = GetUserInfo();
    if (!userInfo) return false;

    return !!userInfo.is_admin;
}

export const GetUserInfo = (): UserInfo | null => {
    const raw = localStorage.getItem('userinfo');
    if (!raw) return null;

    return JSON.parse(raw);
}

export const ToPascalCase = (str: string | undefined) => {
    if (!str) return str;

    return str.replace(/(\w)(\w*)/g,
        function(_,g1,g2){return g1.toUpperCase() + g2.toLowerCase();});
}
