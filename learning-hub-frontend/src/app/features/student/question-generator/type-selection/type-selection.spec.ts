import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { NgZone } from '@angular/core';
import { ɵNoopNgZone as NoopNgZone } from '@angular/core';

import { TypeSelectionComponent } from './type-selection';
import {
  getQuestionTypesForCategory,
  getDisplayNameForQuestionType,
  getCategoryInfo,
} from '../../../../core/models/question.model';

describe('TypeSelectionComponent', () => {
  let component: TypeSelectionComponent;
  let fixture: ComponentFixture<TypeSelectionComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeSelectionComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ subject: 'mathematics', category: 'number-operations' }),
          },
        },
        { provide: NgZone, useClass: NoopNgZone },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TypeSelectionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Component Creation Tests
  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have a title containing "Select"', () => {
      expect(component.title).toContain('Select');
    });

    it('should have a subtitle', () => {
      expect(component.subtitle).toBeDefined();
      expect(component.subtitle.length).toBeGreaterThan(0);
    });
  });

  // Data Loading Tests
  describe('Question Type Data Loading', () => {
    it('should load question types for the selected category on init', () => {
      expect(component.questionTypes).toBeDefined();
      expect(component.questionTypes.length).toBeGreaterThan(0);
    });

    it('should use getQuestionTypesForCategory from Phase 1', () => {
      const categoryKey = 'number-operations';
      const expectedTypes = getQuestionTypesForCategory(categoryKey);
      expect(component.questionTypes.length).toBe(expectedTypes.length);
    });

    it('should transform database types to display names', () => {
      const firstType = component.questionTypes[0];
      expect(firstType.displayName).toBeDefined();
      expect(firstType.displayName).not.toBe(firstType.dbType);
      // Display names should be human-readable (e.g., 'Addition' not 'ADDITION')
      expect(firstType.displayName).toMatch(/^[A-Z][a-z]/);
    });

    it('should handle empty category gracefully', () => {
      component.selectedCategory = '';
      component.loadQuestionTypes();
      expect(component.questionTypes).toBeDefined();
      expect(component.questionTypes.length).toBe(0);
    });
  });

  // Selection State Tests
  describe('Selection State Management', () => {
    it('should initialize with empty selected types array', () => {
      expect(component.selectedTypes).toBeDefined();
      expect(component.selectedTypes).toEqual([]);
    });

    it('should toggle type selection when clicked', () => {
      const typeToSelect = component.questionTypes[0].dbType;
      component.toggleTypeSelection(typeToSelect);
      expect(component.selectedTypes).toContain(typeToSelect);

      // Click again should deselect
      component.toggleTypeSelection(typeToSelect);
      expect(component.selectedTypes).not.toContain(typeToSelect);
    });

    it('should support multi-select (multiple types selected)', () => {
      const type1 = component.questionTypes[0].dbType;
      const type2 = component.questionTypes[1].dbType;

      component.toggleTypeSelection(type1);
      component.toggleTypeSelection(type2);

      expect(component.selectedTypes).toContain(type1);
      expect(component.selectedTypes).toContain(type2);
      expect(component.selectedTypes.length).toBe(2);
    });

    it('should have isTypeSelected method returning correct state', () => {
      const typeToSelect = component.questionTypes[0].dbType;
      expect(component.isTypeSelected(typeToSelect)).toBe(false);

      component.toggleTypeSelection(typeToSelect);
      expect(component.isTypeSelected(typeToSelect)).toBe(true);
    });
  });

  // Query Params Tests
  describe('Query Parameters Handling', () => {
    it('should read subject from query params', () => {
      expect(component.selectedSubject).toBe('mathematics');
    });

    it('should read category from query params', () => {
      expect(component.selectedCategory).toBe('number-operations');
    });
  });

  // Type Rendering Tests
  describe('Question Type Rendering', () => {
    it('should render question type chips in the template', () => {
      const compiled = fixture.nativeElement;
      const chips = compiled.querySelectorAll('.type-chip');
      expect(chips.length).toBe(component.questionTypes.length);
    });

    it('should display friendly names for each type', () => {
      const compiled = fixture.nativeElement;
      const firstChip = compiled.querySelector('.type-chip');
      expect(firstChip?.textContent).toContain(component.questionTypes[0].displayName);
    });

    it('should apply grid layout class', () => {
      const compiled = fixture.nativeElement;
      const grid = compiled.querySelector('.types-grid');
      expect(grid).toBeTruthy();
    });

    it('should display category context in header', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.header');
      expect(header?.textContent).toContain('number-operations');
    });
  });

  // Navigation Tests
  describe('Navigation to Persona Form', () => {
    it('should have a method to proceed to persona form', () => {
      expect(component.proceedToPersonaForm).toBeDefined();
    });

    it('should navigate to persona form with all query params', () => {
      spyOn(router, 'navigate');
      component.selectedTypes = ['ADDITION', 'SUBTRACTION'];
      component.proceedToPersonaForm();

      expect(router.navigate).toHaveBeenCalledWith(['/student/question-generator/persona'], {
        queryParams: {
          subject: 'mathematics',
          category: 'number-operations',
          types: 'ADDITION,SUBTRACTION',
        },
      });
    });

    it('should emit typesSelected event', () => {
      spyOn(component.typesSelected, 'emit');
      component.selectedTypes = ['ADDITION'];
      component.proceedToPersonaForm();

      expect(component.typesSelected.emit).toHaveBeenCalledWith(['ADDITION']);
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle invalid category gracefully', () => {
      component.selectedCategory = 'invalid-category-key';
      component.loadQuestionTypes();
      expect(component.questionTypes).toBeDefined();
      expect(component.questionTypes.length).toBe(0);
    });

    it('should disable proceed button when no types selected', () => {
      const compiled = fixture.nativeElement;
      const proceedButton = compiled.querySelector('.proceed-button');
      expect(proceedButton?.disabled).toBe(true);
    });

    it('should handle empty types array', () => {
      component.questionTypes = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });
});
