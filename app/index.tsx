import { Redirect } from 'expo-router';

// TODO: check onboarding completion from store
// If onboarding done -> redirect to (tabs), else -> onboarding/intro
export default function Index() {
  return <Redirect href="/onboarding/intro" />;
}
