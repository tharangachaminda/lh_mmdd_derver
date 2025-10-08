import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategorySelectionComponent } from './category-selection';
import { Router, ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NgZone, ɵNoopNgZone } from '@angular/core';
import { of } from 'rxjs';

/**
 * CategorySelectionComponent Tests
 *
 * TDD RED Phase: These tests will fail initially as the component doesn't exist yet.
 * Following TDD methodology - write tests first, then implement to make them pass.
 * Uses Zone.js-free Angular test environment for maintainability.
 */
describe('CategorySelectionComponent', () => {
  let component: CategorySelectionComponent;
  let fixture: ComponentFixture<CategorySelectionComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySelectionComponent],
      providers: [
        { provide: NgZone, useClass: ɵNoopNgZone }, // Zone.js-free testing
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ subject: 'mathematics' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategorySelectionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
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

    it('should have a subtitle', () => {
      expect(component.subtitle).toBeDefined();
    });
  });

  describe('Category Data Loading', () => {
    it('should load 8 categories on init', () => {
      expect(component.categories).toBeDefined();
      expect(component.categories.length).toBe(8);
    });

    it('should load categories from Phase 1 QUESTION_CATEGORIES', () => {
      const categoryKeys = component.categories.map((c: any) => c.key);
      expect(categoryKeys).toContain('number-operations');
      expect(categoryKeys).toContain('algebra-patterns');
      expect(categoryKeys).toContain('geometry-measurement');
      expect(categoryKeys).toContain('statistics-probability');
      expect(categoryKeys).toContain('ratios-rates-proportions');
      expect(categoryKeys).toContain('motion-distance');
      expect(categoryKeys).toContain('financial-literacy');
      expect(categoryKeys).toContain('problem-solving-reasoning');
    });

    it('should include category metadata (name, description, skills, icon)', () => {
      component.categories.forEach((category: any) => {
        expect(category.key).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.skillsFocus).toBeDefined();
        expect(category.skillsFocus.length).toBeGreaterThan(0);
        expect(category.icon).toBeDefined();
      });
    });

    it('should have correct icon for each category', () => {
      const numOps = component.categories.find((c: any) => c.key === 'number-operations');
      expect(numOps?.icon).toBe('calculate');

      const algebra = component.categories.find((c: any) => c.key === 'algebra-patterns');
      expect(algebra?.icon).toBe('functions');

      const geometry = component.categories.find((c: any) => c.key === 'geometry-measurement');
      expect(geometry?.icon).toBe('straighten');
    });
  });

  describe('Progress Indicators', () => {
    it('should have progress data for each category', () => {
      component.categories.forEach((category: any) => {
        expect(category.progress).toBeDefined();
        expect(category.progress.completed).toBeDefined();
        expect(category.progress.total).toBeDefined();
      });
    });

    it('should calculate progress percentage correctly', () => {
      const testCategory = {
        ...component.categories[0],
        progress: { completed: 25, total: 100 },
      };
      const percentage = component.getProgressPercentage(testCategory);
      expect(percentage).toBe(25);
    });

    it('should handle zero progress', () => {
      const testCategory = {
        ...component.categories[0],
        progress: { completed: 0, total: 100 },
      };
      const percentage = component.getProgressPercentage(testCategory);
      expect(percentage).toBe(0);
    });

    it('should handle 100% progress', () => {
      const testCategory = {
        ...component.categories[0],
        progress: { completed: 100, total: 100 },
      };
      const percentage = component.getProgressPercentage(testCategory);
      expect(percentage).toBe(100);
    });
  });

  describe('Category Rendering', () => {
    it('should render 8 category cards in the template', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.category-card');
      expect(cards.length).toBe(8);
    });

    it('should display category name in each card', () => {
      const compiled = fixture.nativeElement;
      const numberOpsCard = compiled.querySelector('[data-category="number-operations"]');
      expect(numberOpsCard).toBeTruthy();
      expect(numberOpsCard?.textContent).toContain('Number Operations');
    });

    it('should display category description in each card', () => {
      const compiled = fixture.nativeElement;
      const algebraCard = compiled.querySelector('[data-category="algebra-patterns"]');
      expect(algebraCard?.textContent).toContain('pattern');
    });

    it('should display skills focus points', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.category-card');
      expect(cards[0].querySelectorAll('.skill-chip').length).toBeGreaterThan(0);
    });

    it('should display progress indicator in each card', () => {
      const compiled = fixture.nativeElement;
      const progressBars = compiled.querySelectorAll('.progress-indicator');
      expect(progressBars.length).toBe(8);
    });
  });

  describe('Query Params Handling', () => {
    it('should read subject from query params', () => {
      expect(component.selectedSubject).toBe('mathematics');
    });

    it('should display selected subject in header', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.header');
      expect(header?.textContent).toContain('Mathematics');
    });
  });

  describe('Navigation', () => {
    it('should have a method to handle category selection', () => {
      expect(component.onCategorySelect).toBeDefined();
      expect(typeof component.onCategorySelect).toBe('function');
    });

    it('should navigate to question type selection with correct params', () => {
      spyOn(router, 'navigate');
      component.onCategorySelect('number-operations');
      expect(router.navigate).toHaveBeenCalledWith(
        ['/student/question-generator/types'],
        jasmine.objectContaining({
          queryParams: jasmine.objectContaining({
            subject: 'mathematics',
            category: 'number-operations',
          }),
        })
      );
    });

    it('should emit category selection event', () => {
      spyOn(component.categorySelected, 'emit');
      component.onCategorySelect('algebra-patterns');
      expect(component.categorySelected.emit).toHaveBeenCalledWith('algebra-patterns');
    });
  });

  describe('Responsive Layout', () => {
    it('should apply grid layout class', () => {
      const compiled = fixture.nativeElement;
      const grid = compiled.querySelector('.categories-grid');
      expect(grid).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories array gracefully', () => {
      component.categories = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.category-card');
      expect(cards.length).toBe(0);
    });

    it('should not crash when selecting invalid category', () => {
      expect(() => component.onCategorySelect('invalid-category')).not.toThrow();
    });

    it('should handle missing progress data', () => {
      const testCategory = {
        ...component.categories[0],
        progress: null as any,
      };
      expect(() => component.getProgressPercentage(testCategory)).not.toThrow();
    });
  });
});
