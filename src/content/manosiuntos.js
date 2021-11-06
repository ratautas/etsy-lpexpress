const PRODUCT_WEIGHT = 500; // should come from options
const PRODUCT_TITLE = "Hot Water Bottle"; // should come from options
const PRODUCT_PRICE = 25; // should come from options
const ORIGIN_COUNTRY_ID = 118; // should come from options -- 118 for Lithuania

const OBSERVER_DEFAULTS = { subtree: true, childList: true };

let appRootRef;
let newParcelModalRef;
let currentRefName;
let recipient;

chrome.storage.sync.get("recipient", (result) => {
  recipient = result.recipient;
});

const scrollToNextButton = () =>
  newParcelModalRef.scrollTo({
    top: 9999, // try to scroll to the very bottom where the 'next' button is
    behavior: "smooth",
  });

// hacks to properly trigger angular input change
const setNgInput = (inputRef, value, select = false) => {
  if (inputRef == null) return;
  inputRef.value = value;
  inputRef.dispatchEvent(new Event("focus", { bubbles: true }));
  inputRef.dispatchEvent(new Event("input", { bubbles: true }));
  inputRef.dispatchEvent(new Event("change", { bubbles: true }));
  inputRef.dispatchEvent(new Event("blur", { bubbles: true }));
};

const getCountry = (countryString) => {
  switch (countryString) {
    case "United Kingdom":
      return "Didžioji Britanija";
    case "Canada":
      return "Kanada";
    case "Ireland":
      return "Airija";
    default:
      return "Jungtinės Amerikos Valstijos";
  }
};

const stepOneHandler = (sendItemStepOneRef) => {
  currentRefName = sendItemStepOneRef.localName;

  const fromPostLabelRef = sendItemStepOneRef.querySelector("label[for='from-tab-3']");
  const toAddressLabelRef = sendItemStepOneRef.querySelector("label[for='to-tab-1']");

  const weightObserver = new MutationObserver(() => {
    const weightInputRef = sendItemStepOneRef.querySelector(".parcel-additional-options input");

    if (!weightInputRef) return;

    setNgInput(weightInputRef, (recipient.quantity * PRODUCT_WEIGHT) / 1000);
    weightObserver.disconnect();

    scrollToNextButton();
  });

  const sizeObserver = new MutationObserver(() => {
    const mSizeLabelRef = sendItemStepOneRef.querySelector("label[for='box-s1-sc2-3']");

    if (!mSizeLabelRef) return;

    mSizeLabelRef.click();
    sizeObserver.disconnect();

    weightObserver.observe(sendItemStepOneRef, OBSERVER_DEFAULTS);
  });

  fromPostLabelRef.click();
  toAddressLabelRef.click();

  sizeObserver.observe(sendItemStepOneRef, OBSERVER_DEFAULTS);
};

const stepTwoHandler = (sendItemStepTwoRef) => {
  currentRefName = sendItemStepTwoRef.localName;

  const country = getCountry(recipient.country);
  const enterKeyboardEvent = new KeyboardEvent("keydown", {
    code: "Enter",
    key: "Enter",
    charKode: 13,
    keyCode: 13,
    view: window,
    bubbles: true,
  });

  const recipientInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='recipient']");
  setNgInput(recipientInputRef, recipient.name);

  // TODO: update to simpler selector
  const countryInputRef = sendItemStepTwoRef.querySelector("input[placeholder='Šalis']");

  setTimeout(() => {
    countryInputRef.focus();
    countryInputRef.value = country;
    countryInputRef.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      // wait for countries to refresh and hit enter
      countryInputRef.dispatchEvent(enterKeyboardEvent);

      const cityInputRef = sendItemStepTwoRef.querySelector("input.localityCtrl");
      setNgInput(cityInputRef, recipient.city);

      const firstLineInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='address1']");
      setNgInput(firstLineInputRef, recipient.firstLine);

      const secondLineInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='address2']");
      const { secondLine, state } = recipient;
      const secondLineValue = secondLine ? `${secondLine}, ${state}` : state;
      setNgInput(secondLineInputRef, secondLineValue);

      const zipInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='postalCode']");
      setNgInput(zipInputRef, recipient.zip);

      const emailInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='email']");
      if (recipient.email.length) {
        setNgInput(emailInputRef, recipient.email);
      }

      scrollToNextButton();
    }, 1500);
  }, 500);
};

const stepThreeHandler = (sendItemStepThreeRef) => {
  currentRefName = sendItemStepThreeRef.localName;

  const observer = new MutationObserver(() => {
    const thirdPlanRefs = sendItemStepThreeRef.querySelectorAll("app-service-plan");
    if (thirdPlanRefs.length === 0) return;

    thirdPlanRefs[2].querySelector("button.service-select-button").click();
    observer.disconnect();

    scrollToNextButton();
  });

  observer.observe(sendItemStepThreeRef, OBSERVER_DEFAULTS);
};

const customsFormHandler = (customsFormRef) => {
  currentRefName = customsFormRef.localName;

  const parcelTypeSelectRef = customsFormRef.querySelector("select[formcontrolname='parcelType']");
  if (parcelTypeSelectRef) setNgInput(parcelTypeSelectRef, "SELL");

  const summaryInputRef = customsFormRef.querySelector("input[formcontrolname='summary']");
  if (summaryInputRef && !summaryInputRef.value) setNgInput(summaryInputRef, PRODUCT_TITLE);

  const quantityInputRef = customsFormRef.querySelector("input[formcontrolname='quantity']");
  if (quantityInputRef && !quantityInputRef.value) setNgInput(quantityInputRef, recipient.quantity);

  const weightInputRef = customsFormRef.querySelector("input[formcontrolname='weight']");
  if (weightInputRef && !weightInputRef.value) setNgInput(weightInputRef, recipient.quantity * PRODUCT_WEIGHT);

  const amountInputRef = customsFormRef.querySelector("input[formcontrolname='amount']");
  if (amountInputRef && !amountInputRef.value) setNgInput(amountInputRef, PRODUCT_PRICE * quantityInputRef.value);

  const countrySelectRef = customsFormRef.querySelector("select[formcontrolname='countryId']");
  if (countrySelectRef) setNgInput(countrySelectRef, ORIGIN_COUNTRY_ID);
};

const appObserver = new MutationObserver((mutationsList, observer) => {
  const sendItemStepOneRef = document.querySelector("send-item-step-one");
  const sendItemStepTwoRef = document.querySelector("send-item-step-two");
  const sendItemStepThreeRef = document.querySelector("send-item-step-three");
  const customsFormRef = document.querySelector("form-cn22");

  if (!newParcelModalRef) newParcelModalRef = document.querySelector(".ng-modal-new-parcel");

  if (sendItemStepOneRef && currentRefName !== sendItemStepOneRef?.localName) {
    stepOneHandler(sendItemStepOneRef);
  }

  if (sendItemStepTwoRef && currentRefName !== sendItemStepTwoRef?.localName) {
    stepTwoHandler(sendItemStepTwoRef);
  }

  if (sendItemStepThreeRef && currentRefName !== sendItemStepThreeRef?.localName) {
    stepThreeHandler(sendItemStepThreeRef);
  }

  if (customsFormRef && currentRefName !== customsFormRef?.localName) {
    customsFormHandler(customsFormRef);
  }
});

window.addEventListener("load", () => {
  appObserver.observe(document.querySelector("app-root"), OBSERVER_DEFAULTS);
  newParcelModalRef = document.querySelector(".ng-modal-new-parcel");
});
