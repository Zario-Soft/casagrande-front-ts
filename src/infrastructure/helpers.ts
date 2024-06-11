import moment from "moment";

export const formatDate = (value: any): string => {
    //console.log(value);
    const dt = moment(value, "yyyy-MM-DD");
    //console.log(dt);
    return dt.isValid()
        ? dt.format("DD/MM/YYYY")
        : "--"
}

export const formatDateUnknown = (date: Date) => moment(date).format("yyyy-MM-DD") as unknown as Date;

const moneyFormater = Intl.NumberFormat("pt-br", { style: 'currency', currency: 'BRL' })
export const formatMoney = (params: any) => moneyFormater.format(params);