import React from 'react'
import { AuthContext } from '../providers/auth.provider';

export const useAuth = () => React.useContext(AuthContext);