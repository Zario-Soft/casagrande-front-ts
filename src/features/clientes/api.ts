import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ClienteDTO, ClienteResponse } from "./clientes.contracts";
import { API_URL } from '../../infrastructure/env';
import { concatEndereco, MapResponse } from './clientes-common';

export const clientesApi = createApi({
    reducerPath: 'clientesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        credentials: 'include',
    }),
    tagTypes: ['Clientes'], // This is the "label" for our cache
    endpoints: (builder) => ({
        getAllCombo: builder.query<ClienteDTO[], void>({
            query: () => '/cliente-combo',
            providesTags: ['Clientes'],
        }),
        getById: builder.query<ClienteDTO, number>({
            query: (id) => `/cliente/${id}`,
            transformResponse: (response: ClienteResponse) => {
                return MapResponse(response);
            }
        }),
        // If you handle the Save inside Redux too:
        add: builder.mutation<void, Partial<ClienteDTO>>({
            query: (body) => ({
                url: '/cliente',
                method: 'POST',
                body: { ...body, endereco: concatEndereco(body) },
            }),
            invalidatesTags: ['Clientes'],
        }),
        edit: builder.mutation<void, Partial<ClienteDTO>>({
            query: (body) => ({
                url: '/cliente/' + body.id,
                method: 'PUT',
                body: { ...body, endereco: concatEndereco(body) },
            }),
            invalidatesTags: ['Clientes'],
        }),
    }),
});

export const {
    useGetAllComboQuery,
    useLazyGetByIdQuery,
    useEditMutation, useAddMutation } = clientesApi;