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

export const GetLoggerUser() => {
    const decodedToken = DecodedToken();
    if (!decodedToken) return false;

    return decodedToken.iss;
}

export const parseJwt = (token: string) => {
    if (!token) return;

    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    return JSON.parse(jsonPayload);
}

export const IsAuthorized = (route: string) => {
    const decodedToken = DecodedToken();
    if (!decodedToken) return false;

    if (!!decodedToken.is_admin) return true;

    if (!decodedToken.allowed_routes) 
        decodedToken.allowed_routes = '';

    const allowedRoutes = [...decodedToken.allowed_routes.split(','), '/'];

    return allowedRoutes.find(r => r === route) !== undefined;
}

export const IsAdmin = () => {
    const decodedToken = DecodedToken();
    if (!decodedToken) return false;

    return !!decodedToken.is_admin;
}

const DecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    return parseJwt(token);
}

export const ToPascalCase = (str: string | undefined) => {
    if (!str) return str;

    return str.replace(/(\w)(\w*)/g,
        function(_,g1,g2){return g1.toUpperCase() + g2.toLowerCase();});
}
