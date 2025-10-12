import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  private results = new BehaviorSubject<any>(null);
  results$ = this.results.asObservable();

  setValidationResults(data: any) {
    this.results.next(data);
  }

  clearValidationResults() {
    this.results.next(null);
  }

  getValidationResult() {
    return this.results.value;
  }
}
