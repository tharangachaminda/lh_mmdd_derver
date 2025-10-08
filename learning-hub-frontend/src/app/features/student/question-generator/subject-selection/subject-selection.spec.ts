import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectSelectionComponent } from './subject-selection';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NgZone, ɵNoopNgZone } from '@angular/core';

/**
 * SubjectSelectionComponent Tests
 *
 * TDD GREEN Phase: Component implementation exists, tests should pass.
 * Following TDD methodology - minimal implementation to pass tests.
 * Uses Zone.js-free Angular test environment for maintainability.
 */
describe('SubjectSelectionComponent', () => {
  let component: SubjectSelectionComponent;
  let fixture: ComponentFixture<SubjectSelectionComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectSelectionComponent],
      providers: [
        { provide: NgZone, useClass: ɵNoopNgZone }, // Zone.js-free testing
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectSelectionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have a title', () => {
      expect(component.title).toBeDefined();
      expect(component.title).toContain('Select');
    });
  });

  describe('Subject Data Loading', () => {
    it('should load available subjects on init', () => {
      expect(component.subjects).toBeDefined();
      expect(component.subjects.length).toBeGreaterThan(0);
    });

    it('should include Mathematics as an available subject', () => {
      const mathSubject = component.subjects.find((s: any) => s.key === 'mathematics');
      expect(mathSubject).toBeDefined();
      expect(mathSubject?.name).toBe('Mathematics');
    });

    it('should have subject metadata (name, description, icon)', () => {
      component.subjects.forEach((subject: any) => {
        expect(subject.key).toBeDefined();
        expect(subject.name).toBeDefined();
        expect(subject.description).toBeDefined();
        expect(subject.icon).toBeDefined();
      });
    });
  });

  describe('Subject Rendering', () => {
    it('should render subject cards in the template', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.subject-card');
      expect(cards.length).toBe(component.subjects.length);
    });

    it('should display subject name in each card', () => {
      const compiled = fixture.nativeElement;
      const mathCard = compiled.querySelector('[data-subject="mathematics"]');
      expect(mathCard).toBeTruthy();
      expect(mathCard?.textContent).toContain('Mathematics');
    });

    it('should display subject description in each card', () => {
      const compiled = fixture.nativeElement;
      const mathCard = compiled.querySelector('[data-subject="mathematics"]');
      expect(mathCard?.textContent).toContain('question');
    });
  });

  describe('Navigation', () => {
    it('should have a method to handle subject selection', () => {
      expect(component.onSubjectSelect).toBeDefined();
      expect(typeof component.onSubjectSelect).toBe('function');
    });

    it('should navigate to category selection when subject is clicked', () => {
      spyOn(router, 'navigate');
      component.onSubjectSelect('mathematics');
      expect(router.navigate).toHaveBeenCalledWith(
        ['/student/question-generator/categories'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({ subject: 'mathematics' }),
        })
      );
    });

    it('should emit subject selection event', () => {
      spyOn(component.subjectSelected, 'emit');
      component.onSubjectSelect('mathematics');
      expect(component.subjectSelected.emit).toHaveBeenCalledWith('mathematics');
    });
  });

  describe('Responsive Layout', () => {
    it('should apply grid layout class', () => {
      const compiled = fixture.nativeElement;
      const grid = compiled.querySelector('.subjects-grid');
      expect(grid).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty subjects array gracefully', () => {
      component.subjects = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.subject-card');
      expect(cards.length).toBe(0);
    });

    it('should not crash when selecting invalid subject', () => {
      expect(() => component.onSubjectSelect('invalid-subject')).not.toThrow();
    });
  });
});
