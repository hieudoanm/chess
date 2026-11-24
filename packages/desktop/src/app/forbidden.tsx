import { ErrorTemplate } from '@/components/templates/ErrorTemplate';

const ForbiddenPage = () => (
  <ErrorTemplate
    code="403"
    description="You do not have permission to access this page."
  />
);

export default ForbiddenPage;
