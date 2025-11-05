import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const sendPhotoEmail = async (
  recipientEmail: string,
  photoData: string,
  subject: string = 'Photo from Safety App'
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject,
        photoData,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 