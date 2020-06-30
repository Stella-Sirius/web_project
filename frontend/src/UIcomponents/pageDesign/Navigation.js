import React from 'react';
import { Route, Link, withRouter } from 'react-router-dom';
import { Avatar, FontIcon, ListItem, NavigationDrawer, Button, IconSeparator } from 'react-md';
import imgURL from '../../Images/logoIcon.png';
import NavigationMenuStyle from '../../css/Navigation.css';
import LoginService from '../../Services/LoginService';
import UserService from '../../Services/UserService';
import { upperFirst } from 'lodash/string';

const Item = ({ label, children }) => (
    <IconSeparator style={{ fontFamily: 'cursive', fontSize: '25px', fontWeight: 'bold' }} label={label} iconBefore
        component="li" className="md-cell md-cell--12">
        {children}
    </IconSeparator>
);

const NavLink = ({ label, to, exact, icon }) => (
    <Route path={to} exact={exact}>
        {({ match }) => {
            let leftIcon;
            if (icon) {
                leftIcon = <FontIcon>{icon}</FontIcon>;
            }

            return (
                <ListItem
                    component={Link}
                    active={!!match}
                    to={to}
                    primaryText={label}
                    leftIcon={leftIcon}
                />
            );
        }}
    </Route>
);

const defaultNavItems = [
    {
        label: 'Home',
        to: '/',
        exact: true,
        icon: 'home',
    },
    {
        label: 'Contact us',
        to: '/contact-us',
        icon: 'send'
    },
    {
        label: 'About us',
        to: '/about-us',
        icon: 'book'
    }
];

const logInNavItemsCustomer = [
    {
        label: 'Home',
        to: '/',
        exact: true,
        icon: 'home',
    },
    {
        label: 'Tutorial',
        to: '/booking',
        exact: true,
        icon: 'store',
    },
    {
        label: 'Profile',
        to: '/me',
        icon: 'person'
    },
    {
        label: 'About us',
        to: '/about-us',
        icon: 'book'
    },
    {
        label: 'Contact us',
        to: '/contact-us',
        icon: 'send'
    }
];

const logInNavItemsTutor = [
    {
        label: 'Home',
        to: '/',
        exact: true,
        icon: 'home',
    },
    {
        label: 'Tutorial',
        to: '/booking',
        exact: true,
        icon: 'store',
    },
    {
        label: 'Profile',
        to: '/me',
        icon: 'person'
    },
    {
        label: 'About us',
        to: '/about-us',
        icon: 'book'
    },
    {
        label: 'Contact us',
        to: '/contact-us',
        icon: 'send'
    }

];


class NavigationMenu extends React.Component {

    componentWillReceiveProps = (nextProps) => {
        this.setState({ toolbarTitle: this.getCurrentTitle(nextProps) });
    };

    getCurrentTitle = ({ location: { pathname } }) => {
        const lastSection = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (lastSection === 'navigation-drawers') {
            return 'Inbox';
        }

        return this.toTitle(lastSection);
    };

    toTitle = (str) => {
        return str.split(/-|[A-Z]+/).reduce((s, split) => {
            const capititalized = split.match(/svg$/) ? 'SVG' : upperFirst(split);
            return `${s ? `${s} ` : ''}${capititalized}`;
        }, '');
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            searchValue: [],
            attractions: [],
            titles: [],
            toolbarTitle: this.getCurrentTitle(props),
            navItems: LoginService.isAuthenticated() ? (UserService.getCurrentUser().userType === 'customer' ? logInNavItemsCustomer : logInNavItemsTutor) : defaultNavItems
        };
    }

    logout = () => {
        LoginService.logout();
        this.setState({ navItems: LoginService.isAuthenticated() ? (UserService.getCurrentUser().userType === 'customer' ? logInNavItemsCustomer : logInNavItemsTutor) : defaultNavItems }, () => {
            this.props.history.push('/');
        });
    };

    render() {
        return (
            <div className={this.props.className}>
                <NavigationDrawer
                    style={NavigationMenuStyle}
                    desktopDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY}
                    className="NavigationMenuStyle"
                    drawerTitle="Menu"
                    toolbarActions={
                        LoginService.isAuthenticated() ?
                            <Button id="logoutButton" type="button" flat primary swapTheming onClick={this.logout}>Log out</Button>
                            :
                            <div id="noneName">
                                <Button type="button" id="loginButton" flat primary swapTheming onClick={() => this.props.history.push('/login')}>Login</Button>
                                <Button type="button" id="RegistrationButton" flat primary swapTheming onClick={() => this.props.history.push('/register')}>Register</Button>
                            </div>
                    }
                    navItems={
                        this.state.navItems.map(props => <NavLink {...props} key={props.to} />)
                    }
                    toolbarTitle={

                        <Item label="FindMyTutor">
                            <Button
                                icon
                                style={{ padding: 0 }}
                                onClick={() => this.props.history.push('/')}>
                                <Avatar src={imgURL}
                                    role="presentation"
                                    suffix="green-400" />
                            </Button>
                        </Item>
                    }

                >

                </NavigationDrawer>

            </div>
        );
        //        <Avatar src={imgURL}
        //                role="presentation"
        //                suffix="green-300"/>
    }
}

export default withRouter(NavigationMenu);
