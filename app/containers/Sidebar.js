import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { PublicKeychain } from 'keychain-manager'; delete global._bitcore

import * as IdentityActions from '../actions/identities'
import { getNamesOwned, getIdentities } from '../utils/blockstore-utils'

function mapStateToProps(state) {
  return {
    localIdentities: state.identities.local,
    identityAccount: state.keychain.identityAccounts[0]
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(IdentityActions, dispatch)
}

class Sidebar extends Component {
  static propTypes = {
    localIdentities: PropTypes.array.isRequired,
    createNewIdentity: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      localIdentities: this.props.localIdentities
    }
  }

  componentDidMount() {
    const accountKeychain = new PublicKeychain(this.props.identityAccount.accountKeychain),
          addressIndex = this.props.identityAccount.addressIndex,
          currentAddress = accountKeychain.child(addressIndex).address().toString(),
          _this = this

    getIdentities(currentAddress, this.state.localIdentities, function(localIdentities, newNames) {
      _this.setState({
        localIdentities: localIdentities
      })
      newNames.forEach(function(name) {
        _this.props.createNewIdentity(name)
      })
    })
  }

  render() {
    const localIdentities = this.state.localIdentities || []

    return (
      <div>
        <div className="sidebar-label">Identities</div>
        { localIdentities.length ?
        <ul className="nav sidebar-list">
          { localIdentities.map(function(identity) {
            return (
              <li className="nav-item" key={identity.index}>
                <Link to={"/profile/local/" + identity.index} className="nav-link">
                  {identity.id}
                </Link>
                { identity.registered ?
                  <span></span>
                  :
                  <span>&nbsp;(pending)</span>
                }
              </li>
            )
          })}
        </ul>
        :
        <ul className="nav sidebar-list">-</ul>
        }
        
        <ul className="nav sidebar-list">
          <li className="nav-item">
            <Link to="/register" className="nav-link btn btn-sm btn-secondary">
              Register
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/import" className="nav-link btn btn-sm btn-secondary">
              Import
            </Link>
          </li>
        </ul>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)

/*
<div className="sidebar-label">Registered</div>
{ registeredIdentities.length ?
<ul className="nav sidebar-list">
  { registeredIdentities.map(function(identity) {
    const index = localIdentities.length + identity.index
    return (
      <li className="nav-item" key={identity.index}>
        <Link to={"/profile/local/" + index} className="nav-link">
          {identity.id}
        </Link>
      </li>
    )
  })}
</ul>
:
<ul className="nav sidebar-list">-</ul>
}
*/