/***
 *
 *   APP LAYOUT
 *   Main application layout containing the navigation
 *   and header (title, secondary nav and signed in user)
 *
 *   PROPS
 *   title: title of the view
 *
 **********/

import { Fragment, useContext } from "react";
import { AuthContext, AppNav, Header, User } from "@/components/lib";
import Style from "./app.module.scss";

export function AppLayout(props) {
  // context & style
  const context = useContext<any>(AuthContext); // TODO: Type this
  console.log("AppLayout props:", props);
  console.log("AuthContext data:", context);

  return (
    <Fragment>
      <AppNav
        items={[
          { label: "Dashboard", icon: "activity", link: "/dashboard" },
          { label: "Account", icon: "user", link: "/account" },
          { label: "Help", icon: "help-circle", link: "/help" },
          { label: "Sign Out", icon: "log-out", action: context.signout },
        ]}
      />

      <main className={Style.app}>
        <Header title={props.title}>
          <User />
        </Header>

        {<props.children {...props.data} />}
      </main>
    </Fragment>
  );
}
