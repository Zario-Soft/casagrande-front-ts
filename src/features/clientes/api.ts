import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ClienteDTO } from "./clientes.contracts";
import { API_URL } from '../../infrastructure/env';
import { selectToken } from 'src/redux-ts/slices/auth.slice';
import { concatEndereco } from './clientes-common';
import { RootState } from 'src/redux-ts/store';

export const clientesApi = createApi({
    reducerPath: 'clientesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState;
            const token = selectToken(state);
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Clientes'], // This is the "label" for our cache
    endpoints: (builder) => ({
        getAllCombo: builder.query<ClienteDTO[], void>({
            query: () => '/cliente-combo',
            providesTags: ['Clientes'],
        }),
        // If you handle the Save inside Redux too:
        add: builder.mutation<void, Partial<ClienteDTO>>({
            query: (body) => ({
                url: '/cliente',
                method: 'POST',
                body: {...body, endereco: concatEndereco(body) },
            }),
            invalidatesTags: ['Clientes'],
        }),
        edit: builder.mutation<void, Partial<ClienteDTO>>({
            query: (body) => ({
                url: '/cliente/' + body.id,
                method: 'PUT',
                body: {...body, endereco: concatEndereco(body) },
            }),
            invalidatesTags: ['Clientes'],
        }),
    }),
});

export const { useGetAllComboQuery, useEditMutation, useAddMutation } = clientesApi;