import React, {Component} from 'react';
import { FunnelChart } from 'react-funnel-pipeline'
import 'react-funnel-pipeline/dist/index.css'
import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    startDate: '',
    endDate:'',
    responseToDate: '',
    funnelData: [
      { name: 'Awareness', value: 252 },
      { name: 'Interest', value: 105 },
      { name: 'Consideration', value: 84 },
      { name: 'Evaluation', value: 72 },
      { name: 'Commitment', value: 19 },
      { name: 'Sale', value: 10 }
    ],
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
    const jsonBody = JSON.parse(body)
    console.log("-------",jsonBody.text)
    //this.setState({ responseToDate: body.text, funnelData: body.funnelData})
    this.setState({ responseToDate: jsonBody.text})
    this.setState({ funnelData: jsonBody.funnelData})
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
      <FunnelChart 
        data={this.state.funnelData}
      />
    </div>
    )
  };
}

export default App;
