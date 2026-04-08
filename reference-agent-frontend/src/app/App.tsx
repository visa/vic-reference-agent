/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect, use, useCallback } from 'react';
import './App.css';
// COMPONENTS
import { AppRouter } from './router';
import { Alert } from '@/features/layout/components';
// HOOKS
import { useDispatch, useSelector } from 'react-redux';
// THUNKS
import { fetchCards } from '@/features/cards/thunks/cardsThunks';

// UTILS
import PasskeyManager from '@/features/passkey/components/PasskeyManager/PasskeyManager';
import BaseApiService from '@/lib/api/base';

// TYPES
import { RootState, AppDispatch } from '@/store';
import { MessageType } from '@visa/nova-react';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [alert, setAlert] = useState<{ message: string; messageType?: MessageType, duration: number | null}>({ message: '', duration: 0});
  const { showPasskeyManager, passkeyError } = useSelector((state: RootState) => state.passkey);

  //Initialize API
  useEffect(() => {
    BaseApiService.setDispatch(dispatch);
  }, [dispatch]);
  
  useEffect(() => {
    if (passkeyError) {
      setAlert({
        message: passkeyError,
        messageType: 'error',
        duration: 5000
      });
    }
  }, [passkeyError]);

  useEffect(() => {
    dispatch(fetchCards());
  }, [dispatch]);

  // Check for success_message in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successMessage = params.get('success_message');
    
    if (successMessage) {
      // Clean the URL without reloading the page
      const url = new URL(window.location.href);
      params.delete('success_message');
      
      const newUrl = url.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, document.title, newUrl);
      
      setAlert({
        message: successMessage.replace(/['"]+/g, ''),
        messageType: 'success',
        duration: 5000
      });
    }
  }, []);

  const handleAlertClose = useCallback(() => {  
    setAlert({ message: '', duration: 0 });
    console.log('Alert closed');
  }, []);

  return (
    <div className="App">
      <Alert 
        message={alert.message} 
        messageType={alert.messageType}
        duration={alert.duration}
        onClose={handleAlertClose}
      />

      <AppRouter />

      {showPasskeyManager && <PasskeyManager />}
    </div>
  );
}

export default App;
