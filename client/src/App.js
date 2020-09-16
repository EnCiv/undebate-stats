import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    startDate: '',
    endDate:'',
    responseToDate: ''
  }

  componentDidMount(){
    this.callApi()
      .then(res => this.setState({ response: res.express}))
      .catch(err => console.log(err))
  }

  callApi = async() => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if(response.status !== 200) throw Error(body.message)

    return body;
  }

  handleDates = async e => {
    e.preventDefault()
    const response = await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: this.state.startDate,
        endDate:this.state.endDate
      })
    })
    
    const body = await response.text()

    console.log("-------",body)
    this.setState({ responseToDate: body})
  }


  render() {
    return(
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <code>EnCiv Analytics</code>
        </p>
      </header>
      <form onSubmit={this.handleDates}>
        <p>
          <strong>Input Dates</strong>
        </p>
        <input
          type="text"
          placeholder="2020-08-31"
          value={this.state.startDate}
          onChange= { e => this.setState({startDate:e.target.value})}
        />
        <input
          type="text"
          placeholder="2020-09-09"
          value={this.state.endDate}
          onChange = {e => this.setState({endDate: e.target.value})}
        />
        <button type="submit">Submit</button>
      </form>
      <p style={{whiteSpace: "pre-line"}}>{this.state.responseToDate}</p>
    </div>
    )
  };
}

export default App;
