/* ---------- Data ---------- */
const endorsementList = [
"Addition of GST No.","Chassis Number","Colour Change","Engine Number","Hypothecation Remove","Hypothecation Add",
"Hypothecation Change","Insured name","NCB Certificate","Registration Date","Regst. Number","RTO Endorsement",
"Seating Capacity","Period of Insurance (POI)","PYP Details- POI or Insurer or Policy number","TP details","Communication Address",
"Date of Birth (DOB)","Email Address","Mobile Number","Nominee Details","Salutation","Owner Driver Personal Accident","Paid Driver",
"Un Named Passanger Cover","CNG Addition External","CNG Addition Company fitted","Cubic Capacity (CC)","Fuel Type (Petrol - Diesel, Diesel - petrol)",
"IDV Change","Manufactured Date","Make, Model & Variant","Ownership Transfer","NCB Correction (taken extra NCB)","NCB Correction (taken less NCB)",
"Top Up (PAYD plan)","Multiple Mismatch (Reg no, chassis no & Engine no mismatch)","Post Issuance Cancellation",
"Post Issuance Cancellation (Multiple Mismatch - Reg no, chassis no & Engine no mismatch)","M-Parivahan","Vehicle Details"
];

/* ---------- Helpers ---------- */
function formatDateForMail(dateObj){
  if(!dateObj) return '[DATE]';
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  return dateObj.toLocaleDateString('en-GB', opts); // e.g. 11 Sep 2025
}
function addDays(dateObj, days){
  const d = new Date(dateObj);
  d.setDate(d.getDate()+days);
  return d;
}
function showToast(msg='Copied to clipboard'){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(()=> t.style.opacity='0', 1800);
}

/* ---------- UI elements ---------- */
const categoryEl = document.getElementById('category');
const subLabel = document.getElementById('subLabel');
const subIssueEl = document.getElementById('subIssue');
const subHint = document.getElementById('subHint');
const refundBox = document.getElementById('refundBox');
const mailDateRow = document.getElementById('mailDateRow');
const previewHeader = document.getElementById('previewHeader');
const mailPreview = document.getElementById('mailPreview');
const refundAmountEl = document.getElementById('refundAmount');
const refundDateEl = document.getElementById('refundDate');
const mailDateEl = document.getElementById('mailDate');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');

/* ---------- Populate endorsement sub-issues ---------- */
function populateEndorsement(){
  subIssueEl.innerHTML = '<option value="">-- Select Sub-Issue --</option>';
  endorsementList.forEach(it=>{
    const opt = document.createElement('option');
    opt.value = it; opt.textContent = it;
    subIssueEl.appendChild(opt);
  });
}

/* ---------- When category changes ---------- */
categoryEl.addEventListener('change', ()=>{
  const cat = categoryEl.value;

  // Reset preview header classes
  previewHeader.className = 'previewHeader previewHeader'; // neutral
  previewHeader.classList.remove('endorsement','refund','delay','trail');

  // default visibility
  subLabel.style.display = 'none';
  subIssueEl.style.display = 'none';
  subHint.style.display = 'none';
  refundBox.style.display = 'none';
  mailDateRow.style.display = 'block'; // default show

  // category-specific UI
  if(cat === 'endorsement'){
    subLabel.style.display = 'block';
    subIssueEl.style.display = 'block';
    subHint.style.display = 'block';
    populateEndorsement();
    previewHeader.classList.add('endorsement');
  } else if(cat === 'refund_with_details'){
    refundBox.style.display = 'block';
    mailDateRow.style.display = 'none'; // refund-with-details doesn't need mail date
    previewHeader.classList.add('refund');
  } else if(cat === 'refund_standard'){
    // no refund box; no mailDate required (we keep mailDate optional)
    mailDateRow.style.display = 'none';
    previewHeader.classList.add('refund');
  } else if(cat === 'refund_tat'){
    refundBox.style.display = 'block';
    previewHeader.classList.add('refund');
  } else if(cat === 'delay'){
    previewHeader.classList.add('delay');
  } else if(cat === 'trail'){
    previewHeader.classList.add('trail');
  } else {
    // other categories: keep preview neutral
  }
});

/* ---------- Generate mail ---------- */
generateBtn.addEventListener('click', ()=>{
  const cat = categoryEl.value;
  const sub = subIssueEl.value || '[ISSUE_NAME]';

  // compute base mail date (for TAT calculations): use mailDate if visible, else today
  const mailDateVal = mailDateEl.value ? new Date(mailDateEl.value) : new Date();

  let mailText = '';

  switch(cat){
    /* --- Endorsement --- */
    case 'endorsement': {
      const selected = sub || '[ISSUE_NAME]';
      // special sub-cases
      if(selected === 'Post Issuance Cancellation'){
        const tat = formatDateForMail(addDays(mailDateVal, 10));
        mailText =
`Greetings from PolicyBazaar.Com!

This is in reference to your e-mail.

We have forwarded your request to the insurance company for Cancellation of the policy. Request you to kindly allow us time till ${tat} to share the status update.

The cancellation process usually takes 10 days.

Further, there will be Rs.118/- admin fee and certain deduction/short-scale depending upon policy usage subject to insurance terms & conditions.`;
      } else if(selected.includes('M-Parivahan')){
        const tat = formatDateForMail(addDays(mailDateVal, 10));
        mailText =
`Greetings from Policybazaar.com!

Thank you for your email.

We have received your request for updating the policy on M Parivahan.

We shall share an update with you by ${tat} on your query.

The turnaround time for getting policy update on M Parivahan can take 10 days.`;
      } else {
        const tat = formatDateForMail(addDays(mailDateVal, 10));
        mailText =
`Greetings from Policybazaar.com!

Thank you for your email.

We are forwarding your documents to the Insurance company for making changes in your policy copy regarding ${selected}.

We shall share an update with you by ${tat} on your query.

Charges and inspection (if applicable) will be updated in our future communication post confirmation from the insurance company.`;
      }
      break;
    }

    /* --- Trail --- */
    case 'trail':
      mailText =
`Greetings from Policybazaar.com!

Please be informed that your case is still under progress and we are coordinating with the insurance company for immediate closure on the case.

Request you to kindly allow us time till mentioned in the trail mail.`;
      break;

    /* --- Delay (5 working days) --- */
    case 'delay': {
      const tat = formatDateForMail(addDays(mailDateVal,5));
      mailText =
`Greetings from PolicyBazaar.com!

We deeply regret the inconvenience caused to you due to delay in resolution.

Please allow us time till ${tat} to provide you an update on your pending concern.

We are in constant touch with the Insurer to have your concern resolved on priority.

We appreciate your patience in the interim.`;
      break;
    }

    /* --- Refund with Previous Date & Amount (user inputs) --- */
    case 'refund_with_details': {
      const amount = refundAmountEl.value ? Number(refundAmountEl.value) : null;
      const rDateVal = refundDateEl.value ? new Date(refundDateEl.value) : null;
      const rDateStr = rDateVal ? formatDateForMail(rDateVal) : '[REFUND_DATE]';
      const amountStr = amount!==null ? `₹${new Intl.NumberFormat('en-IN').format(amount)}` : '[AMOUNT]';
      mailText =
`Greetings from PolicyBazaar.com!

This is with reference to your e-mail.

We would like to inform you that a refund of ${amountStr} has been processed in your a/c on the date of ${rDateStr} by the Insurance co., and same shall be credited in 7 working days.

Please contact your respective bank if the refund doesn't reflect in your bank account/wallet automatically within 7 working days from the date of refund process.`;
      break;
    }

    /* --- Refund standard (generic) --- */
    case 'refund_standard':
      mailText =
`Greetings from PolicyBazaar.com!

This is with reference to your e-mail.

We have forwarded your payment details to the Insurance company for refund.

We shall share an update with you shortly on your query.

We shall keep you updated on the status of your query via e-mail.`;
      break;

    /* --- Refund TAT (10 days update) --- */
    case 'refund_tat': {
      const tat = formatDateForMail(addDays(mailDateVal,10));
      const amount = refundAmountEl.value ? Number(refundAmountEl.value) : null;
      const amountStr = amount!==null ? ` of ₹${new Intl.NumberFormat('en-IN').format(amount)}` : '';
      const rDateVal = refundDateEl.value ? new Date(refundDateEl.value) : null;
      const rDateStr = rDateVal ? formatDateForMail(rDateVal) : '[REFUND_DATE]';
      mailText =
`Greetings from PolicyBazaar.com!

We have forwarded your payment details to the Insurance company for refund${amountStr}.

We shall share an update with you by ${tat} on your query.

Refund processed date: ${rDateStr}

We shall keep you updated via e-mail.`;
      break;
    }

    /* --- Unsubscribe --- */
    case 'unsubscribe':
      mailText =
`Greetings from PolicyBazaar.com!

We deeply regret the inconvenience caused to you.

We are forwarding your request to the concerned department regarding unsubscribing from PB communication.

Please allow two working days to get it resolved.`;
      break;

    /* --- Not contactable --- */
    case 'not_contactable':
      mailText =
`Greetings from PolicyBazaar.com!

We tried calling you on the registered contact number with us regarding the concern raised at your end. However, we could not connect.

Kindly share a suitable time and an alternate number with us so that we can update you on your impending query.`;
      break;

    /* --- Endorsement Share --- */
    case 'endorsement_share':
      mailText =
`Greetings from policybazaar.com

This is with reference to your email.

Please find the Endorsement letter attached.
You will need to keep both the policy copy and the endorsement letter together for the duration of the policy period.`;
      break;

    /* --- NCB Confirmation --- */
    case 'ncb_confirmation':
      mailText =
`Greetings from Policybazaar.com!

This is with reference to your e-mail. Please find attached the NCB Confirmation of your policy.`;
      break;

    /* --- Video TAT --- */
    case 'video_tat':
      mailText =
`Greetings from PolicyBazaar.com!

We would like to inform you that we are forwarding your inspection video to our concern team we will update you on the same within 24 hours.

We appreciate your patience in the interim.`;
      break;

    /* --- Closure --- */
    case 'closure':
      mailText =
`Greetings from PolicyBazaar.com!

This is with reference to your e-mail.

As we discussed over call that as the details required to you regarding policy copy has been provided by PolicyBazaar. Hope we are able to address your concern correctly.

For any another query feel free to reach out to us.

Hence as per your confirmation we are going to close the request.`;
      break;

    /* --- ODO Meter --- */
    case 'odo_meter':
      mailText =
`Greetings from PolicyBazaar.com!

This is with reference to your e-mail.

We would like to inform you that the ODO Meter reading will be considered as per the previous records in case of policy renewal before policy expiry.

ODO Meter reading will be considered in new policy as: 
- Previous ODO Meter reading + Plan Opted + KM Addon/Top-up (if any happened during Policy period)

Current ODO Meter Reading: [ENTER MANUALLY]

For more clarification feel free to reach out to us.`;
      break;

    /* --- default --- */
    default:
      mailText = 'Please select a valid category and click Generate Mail.';
  }

  // Put text into preview (editable)
  mailPreview.textContent = mailText;
});

/* ---------- Copy to clipboard ---------- */
copyBtn.addEventListener('click', ()=>{
  const text = mailPreview.innerText || mailPreview.textContent;
  if(!text || text.trim().length<2){
    showToast('Nothing to copy — generate mail first');
    return;
  }
  navigator.clipboard.writeText(text).then(()=> showToast('Mail copied to clipboard'));
});

/* ---------- Small usability: generate on Enter when focused on select? ---------- */
document.getElementById('category').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') e.preventDefault();
});

/* Initialize defaults (optional) */
(function init(){
  // nothing mandatory
})();