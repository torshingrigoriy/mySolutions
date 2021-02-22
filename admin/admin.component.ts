import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AdminService, Patient} from './services/admin.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.sass']
})
export class AdminComponent implements OnInit {
  forms: FormGroup[] = [];
  patients: Patient[] = [];
  accesses = [];
  structures = [];
  searchValue = '';
  isLoading: Boolean = false;
  errorLoading: any;

  constructor(
    private http: HttpClient,
    private adminService: AdminService,
    private fb: FormBuilder
  ) {

  }

  ngOnInit() {
    this.loadData();

  }

  async loadData() {
    this.errorLoading = undefined;
    this.isLoading = true;
    try {
      this.patients = await this.adminService.getPatients();
      this.patients.forEach(patient => {
        let structuresForm = patient.structures.map(s => {
          let accessesForm = s.accesses.map(a => {
            return {
              name: this.fb.control(a.name),
              status: this.fb.control(a.status)
            };
          });
          return [
            {
              name: this.fb.control(s.name),
              accesses: this.fb.array(accessesForm)
            }
          ];
        });
        this.forms.push(this.fb.group({
          patientStructures: this.fb.array(structuresForm)
        }));
      });
      console.log(this.forms)
    }catch (err) {
      console.log(err)
    }finally {
      this.isLoading = false;
    }
  }

  disableForm(i) {
    this.forms[i].disable();
  }

  liveSearch(searchText: string) {
    let filteredUsers;
    filteredUsers = this.patients.filter(user => {
      return user.name.toLocaleUpperCase().trim().replace(/\s+/g, ' ').match(searchText.toLocaleUpperCase()) ||
        user.login.toLocaleUpperCase().trim().replace(/\s+/g, ' ').match(searchText.toLocaleUpperCase());
    });
    return filteredUsers;
  }

}

