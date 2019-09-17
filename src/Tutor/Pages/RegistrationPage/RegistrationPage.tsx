import * as React from "react";

import {PageLayout} from "Common/PageLayout";
import {RegistrationPageCss} from "Tutor/Pages/RegistrationPage/RegistrationPage.css";

export const RegistrationPage = () => (
  <PageLayout title="Înregistrare tutore">
    <form className={RegistrationPageCss.Form}>
      <ul className={RegistrationPageCss.FieldList}>
        <li>
          <label htmlFor="fullName">Nume complet:</label>
          <input type="text" id="fullName" autoFocus />
        </li>
        <li>
          <label htmlFor="email">Adresa de email:</label>
          <input type="email" id="email" />
        </li>
        <li>
          <label htmlFor="password">Parola:</label>
          <input type="password" id="password" />
        </li>
        <li>
          <label htmlFor="passwordConfirmation">Confirmarea parolei:</label>
          <input type="password" id="passwordConfirmation" />
        </li>
      </ul>
    </form>
  </PageLayout>
);
