export const useApiClient=()=>{const c=useRuntimeConfig();return{get:<T>(path:string)=>$fetch<T>(`${c.public.apiBase}${path}`)}}
