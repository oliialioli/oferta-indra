// Line-art icons pulled 1:1 from the Figma "Beneficios Indra Group" frame
// (node 2001:602), matched by theme to the current 6 benefit categories:
//   emotional -> Flexibilidad y conciliación (balance)
//   financial -> Bolsa de beneficios (briefcase)
//   growth    -> Desarrollo y aprendizaje (roadmap pin)
//   physical  -> Bienestar y salud (heart)
//   impact    -> Voluntariado (people)
//   perks     -> Privilege Store (gift/card)
// All use stroke/fill="currentColor" so they inherit the parent's CSS color,
// matching how the MUI icons they replace used to pick up sx={{ color }}.

export function EmotionalIcon(props) {
  return (
    <svg viewBox="0 0 42.1525 33" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20.9069 32.4999V6.87287" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28.9069 32.5H12.9069" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M20.9067 6.87286C22.6666 6.87286 24.0932 5.44625 24.0932 3.68643C24.0932 1.92661 22.6666 0.5 20.9067 0.5C19.1469 0.5 17.7203 1.92661 17.7203 3.68643C17.7203 5.44625 19.1469 6.87286 20.9067 6.87286Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.6525 3.68646H4.90669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.9069 18.8729H1.72049L7.14422 3.68646L12.9069 18.8729Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M0.5 18.8728C0.5 22.5338 3.48305 25.5168 7.21186 25.5846C10.9407 25.5846 14.0593 22.6694 14.1271 18.8728H0.567797H0.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24.5 3.68646H37.2458" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29.3136 18.8729H40.5001L35.0085 3.68646L29.3136 18.8729Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M41.6525 18.8728C41.6525 22.5338 38.6695 25.5168 34.9407 25.5846C31.2119 25.5846 28.0932 22.6694 28.0254 18.8728H41.5848H41.6525Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FinancialIcon(props) {
  return (
    <svg viewBox="0 0 22.6424 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.3988 36.5V34.6026" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5526 36.5V34.6026" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M22.1424 33.7821C22.0399 34.2949 21.5783 34.6539 21.0655 34.6026H7.88602C7.32192 34.6026 6.86038 34.2436 6.8091 33.7308V16.3462C6.96294 15.8334 7.42448 15.4744 7.9373 15.5257H21.0655C21.6296 15.5257 22.0911 15.8846 22.1424 16.3975V33.7821Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.3988 31.5256V18.4999" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5014 31.5256V18.4999" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5526 31.5256V18.4999" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.0399 6.39744H10.9117" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.1937 15.3718V6.39744" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.7578 15.3718V6.39744" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M1.62956 3.57692C1.62956 1.83333 3.01417 0.5 4.70648 0.5C6.39879 0.5 7.78341 1.88462 7.78341 3.57692C7.78341 5.26923 6.39879 6.65385 4.70648 6.65385C3.01417 6.65385 1.62956 5.26923 1.62956 3.57692Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.86036 15.4744V11.4744C8.86036 9.73077 7.52702 8.24359 5.78343 8.19231H3.57831C1.83472 8.24359 0.4501 9.73077 0.501382 11.4744V31.5769"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GrowthIcon(props) {
  return (
    <svg viewBox="0 0 33 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(0, 10.14)">
        <path
          d="M11.9093 8.25386C11.9093 6.26001 10.2478 4.59848 8.25395 4.59848C6.2601 4.59848 4.59856 6.26001 4.59856 8.25386C4.59856 10.2477 6.2601 11.9092 8.25395 11.9092C10.3032 11.9092 11.9093 10.3031 11.9093 8.25386Z"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.0078 8.25385C16.0078 3.98923 12.5186 0.5 8.254 0.5C3.98938 0.5 0.500154 3.98923 0.500154 8.25385C0.500154 8.36462 0.500154 8.42 0.500154 8.53077C0.666308 15.2323 8.254 22.1554 8.254 22.1554C8.254 22.1554 15.7863 15.2323 16.0078 8.53077C16.0078 8.42 16.0078 8.36462 16.0078 8.25385Z"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(22.93, 0)">
        <path
          d="M8.80769 4.65385C8.80769 2.32769 6.92462 0.5 4.65385 0.5C2.32769 0.5 0.5 2.38308 0.5 4.65385C0.5 4.70923 0.5 4.76462 0.5 4.76462C0.610769 8.36462 4.65385 12.0754 4.65385 12.0754C4.65385 12.0754 8.69693 8.36462 8.80769 4.76462C8.80769 4.76462 8.80769 4.70923 8.80769 4.65385Z"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(4.98, 15.62)">
        <path
          d="M0.5 20.8815H23.3185C26.0877 20.8815 28.3031 18.6662 28.3031 15.8969V15.4538C28.3031 12.6846 26.0877 10.4692 23.3185 10.4692H20.66C17.8908 10.4692 15.6754 8.25384 15.6754 5.48461C15.6754 2.71538 17.8908 0.5 20.66 0.5H22.6538"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(25.59, 2.55)">
        <path
          d="M3.60154 2.05077C3.60154 1.16462 2.88154 0.5 2.05077 0.5C1.16462 0.5 0.5 1.22 0.5 2.05077C0.5 2.93692 1.22 3.60154 2.05077 3.60154C2.88154 3.60154 3.60154 2.93692 3.60154 2.05077Z"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function PhysicalIcon(props) {
  return (
    <svg viewBox="0 0 37.0617 33.0002" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.5308 32.5002C18.5308 32.5002 31.6809 19.932 33.9501 16.9645C36.4521 13.706 36.8594 10.1567 36.3939 7.82922C35.9866 5.55996 34.0665 3.29069 32.3209 2.0106C30.5753 0.730501 27.3169 -0.200479 23.8839 1.19599C20.4509 2.59246 18.5308 5.85089 18.5308 5.85089"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5309 32.5002C18.5309 32.5002 5.38086 19.932 3.11159 16.9645C0.609586 13.706 0.202283 10.1567 0.667772 7.82922C1.07508 5.55996 2.99522 3.29069 4.74081 2.0106C6.48639 0.730501 9.74482 -0.200479 13.1778 1.19599C16.6108 2.59246 18.5309 5.85089 18.5309 5.85089"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.39167 8.99286C4.56623 6.43267 6.71912 4.51252 9.22113 4.68708" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImpactIcon(props) {
  return (
    <svg viewBox="0 0 29.734 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.32455 0.5C3.35474 0.5 1.79248 2.13018 1.79248 4.09999C1.79248 6.0698 3.42267 7.63206 5.39248 7.63206C7.36228 7.63206 8.92454 6.00188 8.92454 4.03207C8.92454 2.06226 7.29436 0.5 5.32455 0.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2832 36.5V13.2019C10.2832 11.1642 8.7209 9.46609 6.68316 9.39816H4.10204C2.06431 9.39816 0.434119 11.1642 0.502043 13.2019V36.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.2757 0.5C26.2455 0.5 27.8078 2.06226 27.8078 4.03207C27.8078 6.00188 26.2455 7.56414 24.2757 7.56414C22.3059 7.56414 20.7437 6.00188 20.7437 4.03207C20.7437 2.06226 22.3738 0.5 24.2757 0.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.234 36.5V13.2019C29.234 11.1642 27.6717 9.46609 25.634 9.39816H23.0529C21.0151 9.39816 19.385 11.1642 19.4529 13.2019V36.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20.1321 11.0283L15.0378 19.4509L9.67178 11.3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PerksIcon(props) {
  return (
    <svg viewBox="0 0 32.845 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0 24.2456C0 23.9157 0.247403 23.6683 0.577274 23.6683H3.79352C4.1234 23.6683 4.3708 23.9157 4.3708 24.2456V26.2248C5.11301 25.5651 6.35003 24.9054 8.32926 24.8229C9.31887 24.8229 10.3085 24.8229 11.2981 25.1528C14.5968 26.2248 17.6481 26.7197 20.5345 26.7197H22.2663C23.1735 26.7197 24.0806 27.132 24.6579 27.7917C25.2352 28.6164 25.2352 29.5236 24.6579 30.3482C24.6579 30.3482 24.6579 30.5132 24.493 30.5957H27.5443C28.6164 30.5957 29.5235 31.4203 29.6884 32.4924C29.8534 33.647 29.0287 34.719 27.8742 34.884L17.4832 35.8736C15.339 36.2035 13.1949 35.8736 11.2156 35.0489C10.0611 34.5541 8.82406 34.1418 7.58705 33.8119L4.45327 33.0697V35.2963C4.45327 35.6262 4.20586 35.8736 3.87599 35.8736H0.659743C0.329871 35.8736 0.0824682 35.6262 0.0824682 35.2963V24.2456H0ZM7.75198 32.6573C9.07147 32.9872 10.3085 33.3996 11.5455 33.8944C13.3598 34.6366 15.339 34.9664 17.2358 34.6366L27.6267 33.647C28.1216 33.647 28.4514 33.1522 28.4514 32.6573C28.4514 32.1625 28.0391 31.6677 27.4618 31.6677H16.4111C16.0812 31.6677 15.8338 31.4203 15.8338 31.0905C15.8338 30.7606 16.0812 30.5132 16.4111 30.5132H21.854C22.5137 30.5132 23.1735 30.1833 23.5858 29.6885C23.9157 29.2762 23.9157 28.8638 23.5858 28.4515C23.2559 28.0391 22.6787 27.7917 22.1839 27.7917H20.452C17.4007 27.7917 14.2669 27.2969 10.8858 26.1424C10.0611 25.895 9.15394 25.8125 8.32926 25.895C5.11301 26.0599 4.3708 27.7917 4.28833 28.1216V31.7502L7.66952 32.5749L7.75198 32.6573ZM1.15455 34.719H3.21625V24.8229H1.15455V34.719Z"
        fill="currentColor"
      />
      <path
        d="M16.8234 14.102C16.4935 14.267 16.4111 14.5144 16.4935 14.8442C16.576 15.1741 16.9883 15.2566 17.2357 15.1741L17.7305 14.9267L17.978 15.4215C18.1429 15.8339 18.4728 16.2462 18.8026 16.5761C20.0396 17.5657 21.7715 17.3183 22.7611 16.1637C22.926 15.9163 22.926 15.5865 22.7611 15.4215C22.5137 15.1741 22.1838 15.2566 21.9364 15.4215C21.7715 15.6689 21.5241 15.8339 21.2767 15.9163C20.452 16.2462 19.4624 15.9163 19.1325 15.0092L18.8851 14.5144L20.452 13.8546C20.7819 13.6897 20.8643 13.3598 20.6994 13.1124C20.5345 12.7825 20.2046 12.7001 19.9572 12.865L18.3903 13.5248L18.1429 13.0299C17.813 12.2053 18.1429 11.2157 19.05 10.8858C19.2974 10.8858 19.6273 10.7208 19.8747 10.8858C20.0396 10.8858 20.2046 10.8858 20.2871 10.8858C20.5345 10.7208 20.6169 10.3085 20.2871 10.0611C20.2871 9.89617 20.0396 9.8137 19.8747 9.8137C19.3799 9.8137 18.8851 9.8137 18.4728 9.97864C17.0708 10.5559 16.3286 12.2053 16.9059 13.6897L17.1533 14.1845L16.6585 14.4319L16.8234 14.267V14.102Z"
        fill="currentColor"
      />
      <path
        d="M29.3584 0C30.8428 0 32.1623 1.15455 32.1623 2.63897L32.4097 8.57666L32.822 13.1949V13.4423C32.987 14.6793 32.2448 15.8338 31.1727 16.3286L13.5245 23.5858L12.4525 23.9982C11.0505 24.5754 9.40115 23.9982 8.82388 22.5137L5.52516 14.5143C4.94789 13.1949 5.52516 11.628 6.92712 10.9682C6.92712 10.9682 6.76218 10.7208 6.76218 10.5559L6.51478 3.62859C6.51478 2.0617 7.66933 0.824677 9.15375 0.742209L29.3584 0ZM6.51478 13.9371L9.81349 21.9365C10.1434 22.7611 11.0505 23.1735 11.9577 22.8436L13.0297 22.4313L30.6779 15.1741C31.5026 14.8442 31.9149 13.9371 31.585 13.0299L28.2863 5.03054C28.1214 4.6182 27.7915 4.28833 27.3792 4.12339C26.9668 3.95846 26.5545 3.95846 26.1421 4.12339L7.42192 11.7929C6.59725 12.1228 6.18491 13.0299 6.51478 13.8546V13.9371ZM21.1116 5.03054C20.5343 4.78314 19.7921 5.03054 19.2973 5.44288C19.2973 5.60782 19.0499 5.69028 19.0499 5.85522L21.1116 5.03054ZM7.58686 3.54612L7.83426 10.4734L17.8129 6.35003C17.8129 5.69029 18.0603 5.11301 18.5551 4.6182C19.3798 3.71105 20.7817 3.46365 21.8538 4.04093C21.8538 4.04093 21.8538 4.04093 22.0187 4.04093C22.1837 4.20586 22.1837 4.3708 22.1837 4.53573L25.7298 3.05131C26.8843 2.55651 28.2038 3.05131 28.946 3.95846C29.111 4.12339 29.1934 4.3708 29.2759 4.6182L31.2551 9.56627V8.65913L30.9253 2.72144C30.9253 1.81429 30.1831 1.15455 29.2759 1.15455L9.07128 1.89676C8.65894 1.89676 8.24661 2.14416 7.91673 2.39157C7.58686 2.72144 7.50439 3.13378 7.50439 3.54612H7.58686Z"
        fill="currentColor"
      />
    </svg>
  );
}
