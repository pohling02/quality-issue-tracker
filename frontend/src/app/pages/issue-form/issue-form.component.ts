import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Issue, IssueService } from '../../core/services/issue.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.css',
})
export class IssueFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private issueService = inject(IssueService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  issueId: string | null = null;
  errorMessage = '';

  issueForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    severity: ['Low' as Issue['severity'], Validators.required],
    status: ['Open' as Issue['status'], Validators.required]
  });

  ngOnInit() {
    this.issueId = this.route.snapshot.paramMap.get('id');

    if (this.issueId) {
      this.isEditMode = true;
      this.issueService.getOne(this.issueId).subscribe({
        next: (issue) => {
          // Fill the form with the existing issue data
          this.issueForm.patchValue({
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            status: issue.status
          });
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Failed to load issue details.';
          console.error(err);
        }
      });
    }
  }

  onSubmit() {
    if (this.issueForm.invalid) return;

    const formData = this.issueForm.value;

    if (this.isEditMode && this.issueId) {
      this.issueService.update(this.issueId, formData).subscribe({
        next: () => this.router.navigate(['/issues']),
        error: (err: HttpErrorResponse) => this.errorMessage = 'Failed to update issue.'
      });
    } else {
      this.issueService.create(formData).subscribe({
        next: () => this.router.navigate(['/issues']),
        error: (err: HttpErrorResponse) => this.errorMessage = 'Failed to create issue.'
      });
    }
  }
}