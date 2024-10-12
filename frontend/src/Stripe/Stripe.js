import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51Q97bTKrmiIwU93maIVzAY8KnQdKoZvPsEFikc32g85S5lg5F3U6fXtwLbDRqB7CnBS45JXexZqsCmq3nay6SFkX001jzuHSLZ');

export default stripePromise;