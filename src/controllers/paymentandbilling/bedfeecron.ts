import cron from 'node-cron';
import { readalladmission } from '../../dao/admissions';
import { readoneprice } from '../../dao/price';
import { createpayment, updatepayment } from '../../dao/payment';
import { updatepatientbyanyquery, readonepatient } from '../../dao/patientmanagement';
import configuration from '../../config';

/**
 * Bed Fee Cron Job
 * 
 * Runs every day at midnight (00:00).
 * For every patient currently admitted (status = "admited"):
 *   - Looks up "Bed Fee" price from the Price collection
 *   - Creates a Payment record with category "Bed Fee"
 *   - If patient has sufficient wallet balance:
 *       → Atomically deducts from wallet & confirms payment (status = "paid")
 *   - If patient has insufficient wallet balance:
 *       → Creates payment with status = "pending payment"
 */
export function startBedFeeCronJob() {
  // Runs every day at midnight: "0 0 * * *"
  // For testing, you can change to "* * * * *" (every minute)
  cron.schedule('*/5 * * * *', async () => {
    console.log(`[BedFeeCron] Starting bed fee generation at ${new Date().toISOString()}`);

    try {
      // 1. Find all currently admitted patients (status = "admited")
      const { admissiondetails }: any = await readalladmission(
        { status: configuration.admissionstatus[1] }, // "admited"
        {},
        'patient',
        ''
      );

      if (!admissiondetails || admissiondetails.length === 0) {
        console.log('[BedFeeCron] No admitted patients found.');
        return;
      }

      console.log(`[BedFeeCron] Found ${admissiondetails.length} admitted patient(s).`);

      // 2. Look up Bed Fee price
      const bedFeePrice: any = await readoneprice({
        servicecategory: configuration.category[7], // "Bed Fee"
        status: configuration.status[1],            // "active"
      });

      if (!bedFeePrice) {
        console.error('[BedFeeCron] No active Bed Fee price found. Skipping run.');
        return;
      }

      const bedFeeAmount: number = Number(bedFeePrice.amount);
      const bedFeeServiceType: string = bedFeePrice.servicetype;

      console.log(`[BedFeeCron] Bed Fee amount: ${bedFeeAmount}`);

      // 3. Process each admitted patient
      for (const admission of admissiondetails) {
        const patientDoc: any = admission.patient;
        if (!patientDoc) {
          console.warn(`[BedFeeCron] Admission ${admission._id} has no linked patient. Skipping.`);
          continue;
        }

        const patientId = patientDoc._id;

        try {
          // Generate a unique payment reference for this bed fee charge
          const paymentreference = `BED-${patientDoc.MRN}-${Date.now()}`;

          // Check patient's current wallet balance
          const walletBalance: number = patientDoc.walletBalance || 0;
          const hasSufficientBalance = walletBalance >= bedFeeAmount;

          if (hasSufficientBalance) {
            // ── Wallet has enough funds ──────────────────────────────────────
            // Atomically deduct from wallet first
            const updatedPatient: any = await updatepatientbyanyquery(
              { _id: patientId, walletBalance: { $gte: bedFeeAmount } },
              { $inc: { walletBalance: -bedFeeAmount } }
            );

            const walletBalanceAfterPayment: number = updatedPatient.walletBalance;

            // Create Payment record as "paid"
            await createpayment({
              firstName: patientDoc.firstName,
              lastName: patientDoc.lastName,
              MRN: patientDoc.MRN,
              phoneNumber: patientDoc.phoneNumber,
              paymentreference,
              paymentype: 'Wallet',
              paymentcategory: configuration.category[7], // "Bed Fee"
              patient: patientId,
              amount: bedFeeAmount,
              status: configuration.status[3], // "paid"
              useWallet: true,
              walletBalanceAfterPayment,
              confirmationdate: new Date(),
              cashiername: 'System (Auto)',
            });

            console.log(`[BedFeeCron] ✅ Bed fee PAID for patient ${patientDoc.MRN} | Balance left: ${walletBalanceAfterPayment}`);
          } else {
            // ── Insufficient wallet balance ──────────────────────────────────
            // Create Payment record as "pending payment"
            await createpayment({
              firstName: patientDoc.firstName,
              lastName: patientDoc.lastName,
              MRN: patientDoc.MRN,
              phoneNumber: patientDoc.phoneNumber,
              paymentreference,
              paymentype: 'Wallet',
              paymentcategory: configuration.category[7], // "Bed Fee"
              patient: patientId,
              amount: bedFeeAmount,
              status: configuration.status[2], // "pending payment"
              useWallet: false,
            });

            console.log(`[BedFeeCron] ⚠️ Bed fee PENDING for patient ${patientDoc.MRN} | Wallet: ${walletBalance}, Required: ${bedFeeAmount}`);
          }
        } catch (patientErr: any) {
          // Log per-patient errors but continue processing others
          console.error(`[BedFeeCron] Error processing patient ${patientDoc?.MRN}: ${patientErr.message}`);
        }
      }

      console.log(`[BedFeeCron] Completed at ${new Date().toISOString()}`);
    } catch (err: any) {
      console.error(`[BedFeeCron] Fatal error: ${err.message}`);
    }
  });

  console.log('[BedFeeCron] Bed fee cron job scheduled — runs daily at midnight.');
}
