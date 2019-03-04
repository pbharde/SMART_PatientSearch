import React, { Component } from 'react';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pId: '',
      pCon:[],
      success:false,
      name:'',
      gender:'',
      dob:'',
      clicked:false
     };

    this.onChange = this.onChange.bind(this);
    this.searchPatient = this.searchPatient.bind(this);
  }

  onChange(event) {
    this.setState({ pId: event.target.value });
  }

  searchPatient(event) {
  event.preventDefault();
  if(isNaN(this.state.pId)){
    alert("Please enter valid Patient Id.")
  }
  else{
    this.setState({clicked:true});
    let demographicUrl = `https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Patient/${this.state.pId}`;
    let conditionsUrl = `https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Condition?patient=${this.state.pId}`;

    let demoFetch = fetch(demographicUrl, {headers: { Accept: 'application/json+fhir'}})
    .then(response => response.json());

    let conFetch = fetch(conditionsUrl, {headers: { Accept: 'application/json+fhir'}})
    .then(response => response.json());

    let combinedData = {"demoFetch":{},"conFetch":{}};
    Promise.all([demoFetch,conFetch]).then(values => {
      combinedData["demoFetch"] = values[0];
      combinedData["conFetch"] = values[1];

      if(values[0].name[0].text==="System"){
        alert("Patient not found.")
      }

      else{
        this.setState({
          success:true,
          name:values[0].name,
          gender:values[0].gender,
          birthDate:values[0].birthDate,
          pCon:values[1].entry
        });

      }
      });
  }
}

  render() {
    const {success, pCon, clicked} = this.state;

    let searchResult;
    if(success){
    searchResult =  (
      <div className="data">
        <h1 className="heading">Patient's Demographics</h1>
        <h1 className="demo">Name : {this.state.name[0].text}</h1>
        <h1 className="demo">Gender : {this.state.gender}</h1>
        <h1 className="demo">Date Of Birth : {this.state.birthDate}</h1>
        <h1 className="heading">Patient's Conditions</h1>
        <table id="table">
          <thead>
            <tr>
              <th>Condition Name</th>
              <th>Date Recorded</th>
              <th>Search more for Condition on PubMed</th>
            </tr>
          </thead>
          <tbody>
          {pCon.map(patient=>(
            <tr>
                  <td>{patient.resource.code.text}</td>
                  <td>{patient.resource.dateRecorded}</td>
                  <td>
                    <a
                      href={encodeURI(`https://www.ncbi.nlm.nih.gov/pubmed/?term=${patient.resource.code.text}`)}
                    >
                    search for {patient.resource.code.text} on PubMed
                    </a>
                  </td>
            </tr>
          ))}

        </tbody>
    </table>
        </div>
      )

    }
    else{
      if(!success && clicked)
      searchResult = <div className="data">Loading...</div>
    }
    return (
      <div>
      <div className="mainDiv">

        <h1 className="head">Search Patients from SMART on FHIR</h1>
        <input
        type="text"
        placeholder="Search Patient By Id.."
        name="search"
        id="pId"
        value={this.state.value}
        onChange={this.onChange}
        required
        />
        <button type="submit" className="button" onClick={this.searchPatient}><i className="fa fa-search"></i></button>
      </div>

        <div>
        <label className="small">
            <a
              href="https://github.com/cerner/ignite-learning-lab/wiki/FHIR-Core-Concepts#test-patients"
              target="_blank"
              rel="noopener noreferrer"
            >
                 Click here for sample patient IDs
            </a>
        </label>
        </div>
        {searchResult}
      </div>
    );
  }
}

export default Search;
